/**
 * WebSocket Manager - 基于 reconnecting-websocket 的实现
 * 提供连接管理、消息分发、自动重连等核心功能
 */

import ReconnectingWebSocket, { Options as RWSOptions } from 'reconnecting-websocket'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface WebSocketMessage {
  type: string
  timestamp: string
  data: any
}

export type MessageHandler = (message: WebSocketMessage) => void
export type StatusHandler = (status: ConnectionStatus) => void

export interface WebSocketManagerOptions extends Partial<RWSOptions> {
  heartbeatInterval?: number
  enableHeartbeat?: boolean
}

export class WebSocketManager {
  private rws: ReconnectingWebSocket | null = null
  private url: string = ''
  private status: ConnectionStatus = 'disconnected'
  
  // 订阅者管理
  private messageHandlers = new Map<string, Set<MessageHandler>>()
  private statusHandlers = new Set<StatusHandler>()
  
  // 连接引用计数
  private connectionRefCount = 0
  
  // 心跳管理
  private heartbeatTimer: NodeJS.Timeout | null = null
  private lastHeartbeat: number = 0
  
  // 配置选项
  private options: WebSocketManagerOptions = {
    // reconnecting-websocket 默认配置
    connectionTimeout: 4000,
    maxRetries: Infinity,
    maxReconnectionDelay: 60000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    reconnectionDelayGrowFactor: 1.3,
    minUptime: 5000,
    
    // 自定义配置
    heartbeatInterval: 30000, // 30秒心跳
    enableHeartbeat: true,
  }

  constructor(url?: string, options?: WebSocketManagerOptions) {
    if (url) this.url = url
    if (options) this.options = { ...this.options, ...options }
  }

  /**
   * 连接到 WebSocket 服务器
   */
  async connect(url?: string): Promise<void> {
    if (url) this.url = url
    
    if (!this.url) {
      const error = new Error('WebSocket URL is required')
      console.log('ERROR', 'WebSocket URL is required')
      throw error
    }

    // 增加引用计数
    this.connectionRefCount++
    console.log('INFO', `Connection requested, ref count: ${this.connectionRefCount}`)

    if (this.rws && (this.rws.readyState === WebSocket.CONNECTING || this.rws.readyState === WebSocket.OPEN)) {
      console.log('INFO', 'WebSocket already connected, returning existing connection')
      return Promise.resolve()
    }

    console.log('INFO', `Attempting to connect to WebSocket: ${this.url}`)
    this.setStatus('connecting')
    
    return new Promise((resolve, reject) => {
      try {
        // 创建 ReconnectingWebSocket 实例
        this.rws = new ReconnectingWebSocket(this.url, [], this.options)
        this.setupEventHandlers(resolve, reject)
      } catch (error) {
        console.log('ERROR', 'Failed to create WebSocket connection', error)
        this.setStatus('error')
        this.connectionRefCount-- // 连接失败时减少引用计数
        reject(error)
      }
    })
  }

  /**
   * 断开连接（智能断开，基于引用计数）
   */
  disconnect(): void {
    // 减少引用计数
    this.connectionRefCount = Math.max(0, this.connectionRefCount - 1)
    console.log('INFO', `Disconnect requested, ref count: ${this.connectionRefCount}`)

    // 只有当引用计数为 0 时才真正断开连接
    if (this.connectionRefCount > 0) {
      console.log('INFO', 'Other components still using WebSocket, keeping connection alive')
      return
    }

    console.log('INFO', 'No more references, disconnecting WebSocket')
    this.forceDisconnect()
  }

  /**
   * 强制断开连接（忽略引用计数）
   */
  forceDisconnect(): void {
    console.log('INFO', 'Force disconnecting WebSocket')
    this.connectionRefCount = 0
    this.stopHeartbeat()
    
    if (this.rws) {
      this.rws.close(1000, 'Force disconnect')
      this.rws = null
    }

    this.setStatus('disconnected')
  }

  /**
   * 发送消息
   */
  send(message: WebSocketMessage | string): boolean {
    if (!this.isConnected()) {
      console.warn('WebSocket is not connected')
      return false
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      this.rws!.send(data)
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  /**
   * 订阅特定类型的消息
   */
  subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set())
    }

    this.messageHandlers.get(messageType)!.add(handler)

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.get(messageType)?.delete(handler)
      
      // 如果没有订阅者了，删除整个类型
      if (this.messageHandlers.get(messageType)?.size === 0) {
        this.messageHandlers.delete(messageType)
      }
    }
  }

  /**
   * 订阅连接状态变化
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    
    // 立即发送当前状态
    handler(this.status)

    // 返回取消订阅函数
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.rws?.readyState === WebSocket.OPEN
  }

  /**
   * 手动触发重连
   */
  reconnect(): void {
    if (this.status === 'connecting' || this.status === 'reconnecting') {
      return
    }

    if (this.rws) {
      this.rws.reconnect()
    } else {
      this.connect()
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat || this.heartbeatTimer) {
      return
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        const heartbeat: WebSocketMessage = {
          type: 'ping',
          timestamp: new Date().toISOString(),
          data: { 
            client_id: 'frontend-websocket-manager',
            last_heartbeat: this.lastHeartbeat 
          }
        }
        
        if (this.send(heartbeat)) {
          this.lastHeartbeat = Date.now()
        }
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 设置 ReconnectingWebSocket 事件处理器
   */
  private setupEventHandlers(resolve: () => void, reject: (error: any) => void): void {
    if (!this.rws) return

    // 连接打开
    this.rws.addEventListener('open', () => {
      console.log('SUCCESS', `WebSocket connected to: ${this.url}`)
      console.log('WebSocket connected to:', this.url)
      this.setStatus('connected')
      this.startHeartbeat()
      resolve()
    })

    // 接收消息
    this.rws.addEventListener('message', (event) => {
      this.handleMessage(event)
    })

    // 连接关闭
    this.rws.addEventListener('close', (event) => {
      console.log('WARNING', `WebSocket closed: ${event.code} - ${event.reason}`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
      console.log('WebSocket closed:', event.code, event.reason)
      this.stopHeartbeat()
      
      if (event.code === 1000) {
        // 正常关闭
        this.setStatus('disconnected')
      } else {
        // 异常关闭，reconnecting-websocket 会自动重连
        this.setStatus('reconnecting')
      }
    })

    // 连接错误
    this.rws.addEventListener('error', (error) => {
      console.log('ERROR', 'WebSocket connection error', {
        error: error,
        url: this.url,
        readyState: this.rws?.readyState
      })
      console.error('WebSocket error:', error)
      this.setStatus('error')
      this.stopHeartbeat()
      reject(error)
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      // console.log('WebSocketManager handle message event', message)
      
      // 验证消息格式
      if (!message.type) {
        console.warn('Received message without type:', message)
        return
      }

      // 分发消息给对应的订阅者
      const handlers = this.messageHandlers.get(message.type)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            console.error(`Error in message handler for type ${message.type}:`, error)
          }
        })
      }

      // 处理所有消息的通用订阅者
      const allHandlers = this.messageHandlers.get('*')
      if (allHandlers) {
        allHandlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            console.error('Error in universal message handler:', error)
          }
        })
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, event.data)
    }
  }

  /**
   * 设置连接状态并通知订阅者
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      console.log('WebSocket status changed to:', status)
      
      // 通知所有状态订阅者
      this.statusHandlers.forEach(handler => {
        try {
          handler(status)
        } catch (error) {
          console.error('Error in status handler:', error)
        }
      })
    }
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats() {
    return {
      url: this.url,
      status: this.status,
      isConnected: this.isConnected(),
      lastHeartbeat: this.lastHeartbeat,
      messageHandlers: this.messageHandlers.size,
      statusHandlers: this.statusHandlers.size,
      connectionRefCount: this.connectionRefCount,
      readyState: this.rws?.readyState,
      retryCount: this.rws?.retryCount || 0,
    }
  }

  /**
   * 更新配置选项
   */
  updateOptions(newOptions: Partial<WebSocketManagerOptions>): void {
    this.options = { ...this.options, ...newOptions }
    
    // 如果心跳间隔改变，重启心跳
    if (newOptions.heartbeatInterval && this.heartbeatTimer) {
      this.stopHeartbeat()
      this.startHeartbeat()
    }
  }
}

// 创建单例实例
export const wsManager = new WebSocketManager()