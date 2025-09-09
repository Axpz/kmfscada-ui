'use client'

import React, { useState, useEffect } from 'react'
import { useRealtimeData, useMultiLineRealtimeData, useDataServiceStats, useGlobalDataUpdates } from '@/hooks/useRealtimeData-to-delete'
import { wsManager } from '@/lib/websocket/WebSocketManager'
import { realtimeDataService } from '@/lib/data/RealtimeDataService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Activity, 
  BarChart3, 
  Settings, 
  Trash2, 
  RefreshCw,
  Play,
  Square,
  Wifi,
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function DataServiceTest() {
  const [selectedLineId, setSelectedLineId] = useState('1')
  const [wsConnected, setWsConnected] = useState(false)

  const [totalDataPoints, setTotalDataPoints] = useState(0)

  // 使用各种 Hook
  const singleLineData = useRealtimeData(selectedLineId)
  const multiLineData = useMultiLineRealtimeData(['1', '2', '3', 'sensor_id'])
  const serviceStats = useDataServiceStats()
  const globalUpdates = useGlobalDataUpdates()


  // useEffect(() => {
  //   setTotalDataPoints(multiLineData.dataMap.get('sensor_id')?.length ?? 0)
  // }, [multiLineData])

  // WebSocket 连接状态
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      setWsConnected(status === 'connected')
    })

    return unsubscribe
  }, [])

  // 连接 WebSocket
  const handleConnectWS = async () => {
    try {
      await wsManager.connect('ws://localhost:8080')
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  // 断开 WebSocket
  const handleDisconnectWS = () => {
    wsManager.disconnect()
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN')
  }

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">数据服务测试</h1>
        <div className="flex items-center gap-2">
          <Badge variant={wsConnected ? 'default' : 'destructive'} className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            {wsConnected ? '已连接' : '未连接'}
          </Badge>
          {!wsConnected && (
            <Button onClick={handleConnectWS} size="sm">
              连接 WebSocket
            </Button>
          )}
          {wsConnected && (
            <Button onClick={handleDisconnectWS} variant="outline" size="sm">
              断开连接
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="single-line" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single-line">单生产线</TabsTrigger>
          <TabsTrigger value="multi-line">多生产线</TabsTrigger>
          <TabsTrigger value="service-stats">服务统计</TabsTrigger>
          <TabsTrigger value="global-updates">全局更新</TabsTrigger>
        </TabsList>

        {/* 单生产线数据 */}
        <TabsContent value="single-line" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                单生产线数据测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 生产线选择 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">选择生产线:</span>
                {['1', '2', '3', '4', '5', '6', '7', '8'].map(lineId => (
                  <Button
                    key={lineId}
                    variant={selectedLineId === lineId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLineId(lineId)}
                  >
                    生产线 {lineId}
                  </Button>
                ))}
              </div>

              {/* 数据状态 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{singleLineData.dataCount}</div>
                    <div className="text-sm text-muted-foreground">数据点数量</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {singleLineData.loading ? '加载中' : singleLineData.hasData ? '有数据' : '无数据'}
                    </div>
                    <div className="text-sm text-muted-foreground">数据状态</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {singleLineData.latest ? formatTime(singleLineData.latest.metadata.timestamp) : '--:--:--'}
                    </div>
                    <div className="text-sm text-muted-foreground">最新时间</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {singleLineData.latest?.sensors.motors.screwSpeed?.value?.toFixed(1) || '--'}
                    </div>
                    <div className="text-sm text-muted-foreground">螺杆转速 RPM</div>
                  </CardContent>
                </Card>
              </div>

              {/* 生产线基本信息 */}
              {singleLineData.latest && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-lg font-bold">{singleLineData.latest.name}</div>
                      <div className="text-sm text-muted-foreground">生产线名称</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-lg font-bold">
                        <Badge variant={
                          singleLineData.latest.status === 'running' ? 'default' : 
                          singleLineData.latest.status === 'idle' ? 'secondary' : 'destructive'
                        }>
                          {singleLineData.latest.status === 'running' ? '运行中' : 
                           singleLineData.latest.status === 'idle' ? '空闲' : '离线'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">运行状态</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-lg font-bold">{singleLineData.latest.production.batch.product}</div>
                      <div className="text-sm text-muted-foreground">产品批号</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-lg font-bold">{singleLineData.latest.production.batch.material}</div>
                      <div className="text-sm text-muted-foreground">原料批号</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button onClick={singleLineData.refresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  刷新数据
                </Button>
                <Button onClick={singleLineData.clearData} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  清空数据
                </Button>
              </div>

              {/* 最新数据详情 */}
              {singleLineData.latest && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">最新数据详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="font-medium">机身温度</div>
                        <div className="space-y-1">
                          <div>机身1: {singleLineData.latest.sensors.temperatures.body.zone1?.value?.toFixed(1) || '--'}°C</div>
                          <div>机身2: {singleLineData.latest.sensors.temperatures.body.zone2?.value?.toFixed(1) || '--'}°C</div>
                          <div>机身3: {singleLineData.latest.sensors.temperatures.body.zone3?.value?.toFixed(1) || '--'}°C</div>
                          <div>机身4: {singleLineData.latest.sensors.temperatures.body.zone4?.value?.toFixed(1) || '--'}°C</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">法兰温度</div>
                        <div className="space-y-1">
                          <div>法兰1: {singleLineData.latest.sensors.temperatures.flange.zone1?.value?.toFixed(1) || '--'}°C</div>
                          <div>法兰2: {singleLineData.latest.sensors.temperatures.flange.zone2?.value?.toFixed(1) || '--'}°C</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">模具温度</div>
                        <div className="space-y-1">
                          <div>模具1: {singleLineData.latest.sensors.temperatures.mold.zone1?.value?.toFixed(1) || '--'}°C</div>
                          <div>模具2: {singleLineData.latest.sensors.temperatures.mold.zone2?.value?.toFixed(1) || '--'}°C</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">电机数据</div>
                        <div className="space-y-1">
                          <div>螺杆转速: {singleLineData.latest.sensors.motors.screwSpeed?.value?.toFixed(1) || '--'} RPM</div>
                          <div>牵引速度: {singleLineData.latest.sensors.motors.tractionSpeed?.value?.toFixed(2) || '--'} m/min</div>
                          <div>主轴电流: {singleLineData.latest.sensors.motors.mainSpindleCurrent?.value?.toFixed(1) || '--'} A</div>
                          <div>电机扭矩: {singleLineData.latest.sensors.motors.torque?.value?.toFixed(2) || '--'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">质量数据</div>
                        <div className="space-y-1">
                          <div>实时直径: {singleLineData.latest.production.metrics.diameter?.value?.toFixed(3) || '--'} mm</div>
                          <div>生产长度: {singleLineData.latest.production.metrics.length?.value?.toFixed(2) || '--'} m</div>
                          <div>目标长度: {singleLineData.latest.production.metrics.targetLength?.value?.toFixed(2) || '--'} m</div>
                          <div>氟离子浓度: {singleLineData.latest.production.metrics.fluorideConcentration?.value?.toFixed(2) || '--'} ppm</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 错误信息 */}
              {singleLineData.error && (
                <Card className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">错误: {singleLineData.error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 多生产线数据 */}
        <TabsContent value="multi-line" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                多生产线数据概览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{multiLineData.activeLines}</div>
                    <div className="text-sm text-muted-foreground">活跃生产线</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{multiLineData.totalDataPoints}</div>
                    <div className="text-sm text-muted-foreground">总数据点</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{multiLineData.getAllLatest().length}</div>
                    <div className="text-sm text-muted-foreground">有数据的线</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {multiLineData.loading ? '加载中' : '就绪'}
                    </div>
                    <div className="text-sm text-muted-foreground">状态</div>
                  </CardContent>
                </Card>
              </div>

              {/* 各生产线状态 */}
              <div className="space-y-2">
                <h4 className="font-medium">各生产线状态</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['1', '2', '3', 'sensor_id'].map(lineId => {
                    const lineData = multiLineData.getLineData(lineId)
                    const lineLatest = multiLineData.getLineLatest(lineId)
                    
                    return (
                      <Card key={lineId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">生产线 {lineId}</span>
                            <Badge variant={lineLatest ? 'default' : 'secondary'}>
                              {lineLatest ? '运行中' : '无数据'}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>数据点: {lineData.length}/60</div>
                            {lineLatest && (
                              <>
                                <div>最新时间: {formatTime(lineLatest.metadata.timestamp)}</div>
                                <div>螺杆转速: {lineLatest.sensors.motors.screwSpeed?.value?.toFixed(1) || '--'} RPM</div>
                                <div>实时直径: {lineLatest.production.metrics.diameter?.value?.toFixed(3) || '--'} mm</div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 服务统计 */}
        <TabsContent value="service-stats" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                数据服务统计
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => serviceStats.setAutoRefresh(!serviceStats.autoRefresh)}
                  variant={serviceStats.autoRefresh ? 'default' : 'outline'}
                  size="sm"
                >
                  {serviceStats.autoRefresh ? '停止自动刷新' : '开启自动刷新'}
                </Button>
                <Button onClick={serviceStats.refresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 服务状态 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serviceStats.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="text-2xl font-bold">
                        {serviceStats.isRunning ? '运行中' : '已停止'}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">服务状态</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{formatDuration(serviceStats.uptime)}</div>
                    <div className="text-sm text-muted-foreground">运行时间</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{serviceStats.messageCount}</div>
                    <div className="text-sm text-muted-foreground">接收消息数</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{serviceStats.errorCount}</div>
                    <div className="text-sm text-muted-foreground">错误次数</div>
                  </CardContent>
                </Card>
              </div>

              {/* 服务控制 */}
              <div className="flex gap-2">
                <Button 
                  onClick={serviceStats.startService} 
                  disabled={serviceStats.isRunning}
                  className="flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  启动服务
                </Button>
                <Button 
                  onClick={serviceStats.stopService} 
                  disabled={!serviceStats.isRunning}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Square className="h-4 w-4" />
                  停止服务
                </Button>
                <Button 
                  onClick={serviceStats.clearAllData} 
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  清空所有数据
                </Button>
              </div>

              {/* 队列统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">队列统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(serviceStats.stats.queues).map(([lineId, queueStats]) => (
                      <div key={lineId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="font-medium">生产线 {lineId}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>大小: {queueStats.size}/{queueStats.maxSize}</span>
                          <span>利用率: {queueStats.utilizationRate.toFixed(1)}%</span>
                          <span>时间跨度: {formatDuration(queueStats.timeSpan)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 全局更新 */}
        <TabsContent value="global-updates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                全局数据更新日志
              </CardTitle>
              <Button onClick={globalUpdates.clearUpdates} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                清空日志
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="outline">
                  总更新次数: {globalUpdates.updateCount}
                </Badge>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {globalUpdates.updates.map((update, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">生产线 {update.lineId}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>数据点: {update.dataCount}</span>
                        <span className="text-muted-foreground">
                          {formatTime(update.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {globalUpdates.updates.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      暂无更新记录
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}