'use client'

import React, { useState, useEffect } from 'react'
import { wsManager, ConnectionStatus, WebSocketMessage } from '@/lib/websocket/WebSocketManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  Play, 
  Square, 
  Activity,
  AlertTriangle,
  Settings,
  MessageSquare
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  type: 'status' | 'message' | 'error'
  content: string
  data?: any
}

export default function WebSocketTest() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [messageCount, setMessageCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080')

  // 添加日志条目
  const addLog = (type: LogEntry['type'], content: string, data?: any) => {
    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      content,
      data
    }
    
    setLogs(prev => [logEntry, ...prev.slice(0, 99)]) // 保持最新100条日志
  }

  // 连接状态处理
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      setConnectionStatus(status)
      addLog('status', `Connection status changed to: ${status}`)
    })

    return unsubscribe
  }, [])

  // 消息订阅
  useEffect(() => {
    // 订阅所有消息
    const unsubscribeAll = wsManager.subscribe('*', (message) => {
      setMessageCount(prev => prev + 1)
      setLastMessage(message)
      addLog('message', `Received ${message.type} message`, message.data)
    })

    // 订阅生产数据
    const unsubscribeProduction = wsManager.subscribe('production_data', (message) => {
      addLog('message', `Production data for line ${message.data.production_line_id}`, {
        lineId: message.data.production_line_id,
        temperatures: message.data.body_temperatures,
        speeds: {
          screw: message.data.screw_motor_speed,
          traction: message.data.traction_motor_speed
        }
      })
    })

    // 订阅告警
    const unsubscribeAlarm = wsManager.subscribe('alarm', (message) => {
      addLog('error', `🚨 ALARM: ${message.data.message} on line ${message.data.production_line_id}`, message.data)
    })

    return () => {
      unsubscribeAll()
      unsubscribeProduction()
      unsubscribeAlarm()
    }
  }, [])

  // 连接操作
  const handleConnect = async () => {
    try {
      addLog('status', `Attempting to connect to ${wsUrl}`)
      await wsManager.connect(wsUrl)
      addLog('status', 'Connection successful!')
    } catch (error) {
      addLog('error', `Connection failed: ${error}`)
    }
  }

  const handleDisconnect = () => {
    wsManager.disconnect()
    addLog('status', 'Disconnected manually')
  }

  const handleReconnect = () => {
    addLog('status', 'Manual reconnect triggered')
    wsManager.reconnect()
  }

  // 发送测试消息
  const sendHeartbeat = () => {
    const message: WebSocketMessage = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      data: { client_id: 'websocket-test-component' }
    }
    
    const success = wsManager.send(message)
    addLog(success ? 'message' : 'error', success ? 'Heartbeat sent' : 'Failed to send heartbeat')
  }

  const requestData = () => {
    const message: WebSocketMessage = {
      type: 'request_data',
      timestamp: new Date().toISOString(),
      data: { line_id: '1' }
    }
    
    const success = wsManager.send(message)
    addLog(success ? 'message' : 'error', success ? 'Data request sent' : 'Failed to send data request')
  }

  // 清空日志
  const clearLogs = () => {
    setLogs([])
    setMessageCount(0)
    setLastMessage(null)
  }

  // 状态样式
  const getStatusBadge = (status: ConnectionStatus) => {
    const configs = {
      connected: { variant: 'default' as const, icon: Wifi, text: '已连接', className: 'bg-green-500' },
      connecting: { variant: 'secondary' as const, icon: Activity, text: '连接中', className: 'bg-blue-500' },
      reconnecting: { variant: 'secondary' as const, icon: RotateCcw, text: '重连中', className: 'bg-yellow-500' },
      disconnected: { variant: 'outline' as const, icon: WifiOff, text: '未连接', className: 'bg-gray-500' },
      error: { variant: 'destructive' as const, icon: AlertTriangle, text: '连接错误', className: 'bg-red-500' },
    }

    const config = configs[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WebSocket Manager 测试</h1>
        {getStatusBadge(connectionStatus)}
      </div>

      {/* 连接控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            连接控制
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="WebSocket URL"
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleConnect} 
              disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              连接
            </Button>
            
            <Button 
              onClick={handleDisconnect} 
              disabled={connectionStatus === 'disconnected'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              断开
            </Button>
            
            <Button 
              onClick={handleReconnect} 
              disabled={connectionStatus === 'connecting' || connectionStatus === 'reconnecting'}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              重连
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 消息测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            消息测试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={sendHeartbeat} 
              disabled={!wsManager.isConnected()}
              variant="outline"
            >
              发送心跳
            </Button>
            
            <Button 
              onClick={requestData} 
              disabled={!wsManager.isConnected()}
              variant="outline"
            >
              请求数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">连接状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStatus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">消息总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">最后消息类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastMessage?.type || 'None'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">重连次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wsManager.getConnectionStats?.()?.retryCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最后消息详情 */}
      {lastMessage && (
        <Card>
          <CardHeader>
            <CardTitle>最后接收的消息</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 日志 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>实时日志</CardTitle>
          <Button onClick={clearLogs} variant="outline" size="sm">
            清空日志
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-2 rounded text-sm ${
                    log.type === 'error' ? 'bg-red-50 text-red-800' :
                    log.type === 'status' ? 'bg-blue-50 text-blue-800' :
                    'bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{log.content}</span>
                    <span className="text-xs opacity-60">{log.timestamp}</span>
                  </div>
                  {log.data && (
                    <pre className="mt-1 text-xs opacity-80 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              
              {logs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  暂无日志记录
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}