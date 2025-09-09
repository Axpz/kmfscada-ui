/**
 * 实时数据上下文 - 基础版本
 * 提供 WebSocket 连接管理和数据服务集成的基础功能
 */

'use client'

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useRef,
  useCallback
} from 'react'
import { wsManager, ConnectionStatus } from '@/lib/websocket/WebSocketManager'
import { realtimeDataService } from '@/lib/data/RealtimeDataService'

// Context 类型定义
export interface RealtimeDataContextType {
  // 基础连接状态
  connectionStatus: ConnectionStatus
  isConnected: boolean
  isInitialized: boolean
  
  // 数据服务状态
  serviceStats: any
  
  // 连接控制
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => void
  
  // 配置管理
  wsUrl: string
  setWsUrl: (url: string) => void
  
  // 错误处理
  lastError: string | null
  clearError: () => void
}

// 创建 Context
const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined)

// 默认 WebSocket URL
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'

/**
 * 实时数据提供者组件 - 基础版本
 */
export function RealtimeDataProvider({ children }: { children: React.ReactNode }) {
  // 基础状态
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL)
  const [serviceStats, setServiceStats] = useState<any>({})
  
  // Refs
  const isMountedRef = useRef(true)
  const statsTimerRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket 状态监听
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      if (!isMountedRef.current) return
      
      setConnectionStatus(status)
      
      if (status === 'connected') {
        setLastError(null)
      }
    })

    return unsubscribe
  }, [])

  // 数据服务统计监听
  useEffect(() => {
    const updateStats = () => {
      if (!isMountedRef.current) return
      
      const stats = realtimeDataService.getStats()
      setServiceStats(stats)
    }

    // 立即更新一次
    updateStats()
    
    // 定期更新统计信息
    statsTimerRef.current = setInterval(updateStats, 2000) // 每2秒更新
    
    return () => {
      if (statsTimerRef.current) {
        clearInterval(statsTimerRef.current)
      }
    }
  }, [])

  // 自动初始化 - Provider 挂载时自动连接
  useEffect(() => {
    const autoInitialize = async () => {
      if (!isMountedRef.current) return
      
      try {
        console.log('🚀 RealtimeDataProvider: Auto-initializing...')
        
        // 连接 WebSocket
        console.log('connecting to WebSocket...', wsUrl)
        await wsManager.connect(wsUrl)
        
        // 初始化数据服务
        if (!realtimeDataService.getStats().service.isInitialized) {
          await realtimeDataService.initialize()
        }
        
        // 启动数据服务
        if (!realtimeDataService.getStats().service.isRunning) {
          await realtimeDataService.start()
        }
        
        setIsInitialized(true)
        console.log('✅ RealtimeDataProvider: Auto-initialization completed')
        
      } catch (error) {
        console.error('❌ RealtimeDataProvider: Auto-initialization failed:', error)
        setLastError(error instanceof Error ? error.message : 'Initialization failed')
      }
    }

    autoInitialize()
  }, [wsUrl])

  // 手动连接控制
  const connect = useCallback(async () => {
    try {
      setLastError(null)
      console.log('🔌 Manual connect requested')
      
      await wsManager.connect(wsUrl)
      
      if (!realtimeDataService.getStats().service.isInitialized) {
        await realtimeDataService.initialize()
      }
      
      if (!realtimeDataService.getStats().service.isRunning) {
        await realtimeDataService.start()
      }
      
      setIsInitialized(true)
      console.log('✅ Manual connect completed')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      console.error('❌ Manual connect failed:', errorMessage)
      setLastError(errorMessage)
      throw error
    }
  }, [wsUrl])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnect requested')
    wsManager.disconnect()
    realtimeDataService.stop()
    setLastError(null)
  }, [])

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnect requested')
    wsManager.reconnect()
  }, [])

  // 错误清理
  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  // 组件卸载清理
  useEffect(() => {
    return () => {
      console.log('🧹 RealtimeDataProvider: Cleaning up...')
      isMountedRef.current = false
      
      if (statsTimerRef.current) {
        clearInterval(statsTimerRef.current)
      }
      
      // 清理连接
      wsManager.disconnect()
      realtimeDataService.stop()
    }
  }, [])

  // Context 值
  const contextValue: RealtimeDataContextType = {
    // 基础连接状态
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isInitialized,
    
    // 数据服务状态
    serviceStats,
    
    // 连接控制
    connect,
    disconnect,
    reconnect,
    
    // 配置管理
    wsUrl,
    setWsUrl,
    
    // 错误处理
    lastError,
    clearError,
  }

  return (
    <RealtimeDataContext.Provider value={contextValue}>
      {children}
    </RealtimeDataContext.Provider>
  )
}

/**
 * 使用实时数据上下文的 Hook
 */
export function useRealtimeDataContext() {
  const context = useContext(RealtimeDataContext)
  if (!context) {
    throw new Error('useRealtimeDataContext must be used within a RealtimeDataProvider')
  }
  return context
}

/**
 * 连接状态 Hook - 简化的接口
 */
export function useConnectionStatus() {
  const { connectionStatus, isConnected, lastError, reconnect } = useRealtimeDataContext()
  
  return {
    status: connectionStatus,
    isConnected,
    error: lastError,
    reconnect,
  }
}