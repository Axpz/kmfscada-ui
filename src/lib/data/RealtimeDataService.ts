/**
 * 实时数据服务 - 数据管理层
 * 负责订阅 WebSocket 消息，缓存数据，并提供数据访问接口
 */

import { wsManager, WebSocketMessage } from '@/lib/websocket/WebSocketManager'
import type { ProductionLineData } from '@/types'


// 数据订阅回调类型
export type DataSubscriber = (data: ProductionLineData[]) => void
export type LatestDataSubscriber = (data: ProductionLineData | null) => void

// 数据缓存队列类
class DataQueue {
  private queue: ProductionLineData[] = []
  private readonly maxSize: number = 60
  private timestampMap: Map<number, boolean> = new Map();

  constructor(maxSize: number = 60) {
    this.maxSize = maxSize
  }

  /**
   * 添加数据点到队列
   */
  addDataPoint(dataPoint: ProductionLineData): void {
    // 去重检查 - 基于时间戳和生产线ID
    if (this.timestampMap.has(dataPoint.metadata.timestamp)) {
      console.warn('Duplicate data point detected, skipping:', {
        lineId: dataPoint.id,
        timestamp: dataPoint.metadata.timestamp
      })
      return
    }

    this.queue.push(dataPoint)
    this.timestampMap.set(dataPoint.metadata.timestamp, true)

    console.log('this.queue.length', this.queue.length)

    // 维护队列大小 - FIFO (First In, First Out)
    if (this.queue.length > this.maxSize) {
      const removed = this.queue.shift()
      this.timestampMap.delete(removed?.metadata.timestamp ?? 0)
      console.debug(`Queue size exceeded, removed oldest data point:`, removed)
    }
  }

  /**
   * 获取所有数据点
   */
  getAllData(): ProductionLineData[] {
    return [...this.queue] // 返回副本，避免外部修改
  }

  /**
   * 获取最新数据点
   */
  getLatestData(): ProductionLineData | null {
    return this.queue[this.queue.length - 1] ?? null
  }

  /**
   * 获取指定数量的最新数据点
   */
  getRecentData(count: number): ProductionLineData[] {
    if (count <= 0) return []
    if (count >= this.queue.length) return this.getAllData()
    
    return this.queue.slice(-count)
  }

  /**
   * 获取队列大小
   */
  getSize(): number {
    return this.queue.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }

  /**
   * 获取队列统计信息
   */
  getStats() {
    const latest = this.getLatestData()
    const oldest = this.queue.length > 0 ? this.queue[0] : null
    
    return {
      size: this.queue.length,
      maxSize: this.maxSize,
      utilizationRate: (this.queue.length / this.maxSize) * 100,
      timeSpan: latest && oldest ? latest.metadata.timestamp - oldest.metadata.timestamp : 0,
      latestTimestamp: latest?.metadata.timestamp || null,
      oldestTimestamp: oldest?.metadata.timestamp || null
    }
  }
}

/**
 * 实时数据服务类
 */
export class RealtimeDataService {
  private static instance: RealtimeDataService
  
  // 按生产线ID分组的数据缓存
  private dataQueues = new Map<string, DataQueue>()
  
  // 订阅者管理
  private dataSubscribers = new Map<string, Set<DataSubscriber>>()
  private latestDataSubscribers = new Map<string, Set<LatestDataSubscriber>>()
  private globalSubscribers = new Set<(lineId: string, data: ProductionLineData[]) => void>()
  
  // WebSocket 订阅管理
  private wsUnsubscribers: (() => void)[] = []
  
  // 服务状态
  private isInitialized = false
  private isRunning = false
  
  // 统计信息
  private stats = {
    totalMessagesReceived: 0,
    totalDataPointsProcessed: 0,
    lastMessageTime: 0,
    errorCount: 0,
    startTime: 0
  }

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 获取单例实例
   */
  static getInstance(): RealtimeDataService {
    if (!RealtimeDataService.instance) {
      RealtimeDataService.instance = new RealtimeDataService()
    }
    return RealtimeDataService.instance
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('RealtimeDataService is already initialized')
      return
    }

    console.log('Initializing RealtimeDataService...')
    
    try {
      // 订阅 WebSocket 消息
      this.setupWebSocketSubscriptions()
      
      this.isInitialized = true
      this.isRunning = true
      this.stats.startTime = Date.now()
      
      console.log('RealtimeDataService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RealtimeDataService:', error)
      throw error
    }
  }

  /**
   * 启动服务
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    if (this.isRunning) {
      console.warn('RealtimeDataService is already running')
      return
    }

    this.isRunning = true
    console.log('RealtimeDataService started')
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('RealtimeDataService is not running')
      return
    }

    // 取消 WebSocket 订阅
    this.wsUnsubscribers.forEach(unsubscribe => unsubscribe())
    this.wsUnsubscribers = []
    
    this.isRunning = false
    console.log('RealtimeDataService stopped')
  }

  /**
   * 订阅指定生产线的数据更新
   */
  subscribe(lineId: string, callback: DataSubscriber): () => void {
    if (!this.dataSubscribers.has(lineId)) {
      this.dataSubscribers.set(lineId, new Set())
    }

    this.dataSubscribers.get(lineId)!.add(callback)

    // 立即发送当前数据
    const currentData = this.getHistoryData(lineId)
    callback(currentData)

    console.debug(`Added subscriber for line ${lineId}, total subscribers: ${this.dataSubscribers.get(lineId)!.size}`)

    // 返回取消订阅函数
    return () => {
      this.dataSubscribers.get(lineId)?.delete(callback)
      
      // 如果没有订阅者了，清理 Set
      if (this.dataSubscribers.get(lineId)?.size === 0) {
        this.dataSubscribers.delete(lineId)
      }
      
      console.debug(`Removed subscriber for line ${lineId}`)
    }
  }

  /**
   * 订阅指定生产线的最新数据更新
   */
  subscribeLatest(lineId: string, callback: LatestDataSubscriber): () => void {
    if (!this.latestDataSubscribers.has(lineId)) {
      this.latestDataSubscribers.set(lineId, new Set())
    }

    this.latestDataSubscribers.get(lineId)!.add(callback)

    // 立即发送当前最新数据
    const latestData = this.getLatestData(lineId)
    callback(latestData)

    // 返回取消订阅函数
    return () => {
      this.latestDataSubscribers.get(lineId)?.delete(callback)
      
      if (this.latestDataSubscribers.get(lineId)?.size === 0) {
        this.latestDataSubscribers.delete(lineId)
      }
    }
  }

  /**
   * 订阅全局数据更新（所有生产线）
   */
  subscribeGlobal(callback: (lineId: string, data: ProductionLineData[]) => void): () => void {
    this.globalSubscribers.add(callback)

    // 立即发送所有现有数据
    this.dataQueues.forEach((queue, lineId) => {
      callback(lineId, queue.getAllData())
    })

    return () => {
      this.globalSubscribers.delete(callback)
    }
  }

  /**
   * 获取指定生产线的历史数据
   */
  getHistoryData(lineId: string): ProductionLineData[] {
    const queue = this.getOrCreateQueue(lineId)
    return queue.getAllData()
  }

  /**
   * 获取指定生产线的最新数据
   */
  getLatestData(lineId: string): ProductionLineData | null {
    const queue = this.getOrCreateQueue(lineId)
    return queue.getLatestData()
  }

  /**
   * 获取指定生产线的最近N个数据点
   */
  getRecentData(lineId: string, count: number): ProductionLineData[] {
    const queue = this.getOrCreateQueue(lineId)
    return queue.getRecentData(count)
  }

  /**
   * 获取所有生产线的最新数据
   */
  getAllLatestData(): Map<string, ProductionLineData | null> {
    const result = new Map<string, ProductionLineData | null>()
    
    this.dataQueues.forEach((queue, lineId) => {
      result.set(lineId, queue.getLatestData())
    })
    
    return result
  }

  /**
   * 清空指定生产线的数据
   */
  clearLineData(lineId: string): void {
    const queue = this.dataQueues.get(lineId)
    if (queue) {
      queue.clear()
      console.log(`Cleared data for line ${lineId}`)
      
      // 通知订阅者
      this.notifySubscribers(lineId, [])
    }
  }

  /**
   * 清空所有数据
   */
  clearAllData(): void {
    this.dataQueues.forEach((queue, lineId) => {
      queue.clear()
      this.notifySubscribers(lineId, [])
    })
    
    console.log('Cleared all data')
  }

  /**
   * 获取服务统计信息
   */
  getStats() {
    const queueStats = new Map<string, any>()
    
    this.dataQueues.forEach((queue, lineId) => {
      queueStats.set(lineId, queue.getStats())
    })

    return {
      service: {
        ...this.stats,
        isInitialized: this.isInitialized,
        isRunning: this.isRunning,
        uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0,
        subscriberCount: Array.from(this.dataSubscribers.values()).reduce((sum, set) => sum + set.size, 0),
        activeLines: this.dataQueues.size
      },
      queues: Object.fromEntries(queueStats)
    }
  }

  /**
   * 设置 WebSocket 订阅
   */
  private setupWebSocketSubscriptions(): void {
    // 订阅生产数据
    const unsubscribeProduction = wsManager.subscribe('production_data', (data) => {
      this.handleProductionData(data)
    })

    // 订阅message数据
    const unsubscribeAlarm = wsManager.subscribe('message', (message) => {
      this.handleAlarmData(message)
    })

    // 订阅系统状态
    const unsubscribeStatus = wsManager.subscribe('system_status', (status) => {
      this.handleSystemStatus(status)
    })

    // 保存取消订阅函数
    this.wsUnsubscribers.push(unsubscribeProduction, unsubscribeAlarm, unsubscribeStatus)
  }

  /**
   * 处理生产数据消息
   */
  private handleProductionData(message: WebSocketMessage): void {
    try {
      this.stats.totalMessagesReceived++
      this.stats.lastMessageTime = Date.now()

      console.log('-----Received message.data:', message.data)

      const rawData = message.data as ProductionLineData
      
      // 添加到对应的队列
      const lineId = rawData.id
      const queue = this.getOrCreateQueue(lineId)
      queue.addDataPoint(rawData)
      
      this.stats.totalDataPointsProcessed++

      // 通知订阅者
      this.notifySubscribers(lineId, queue.getAllData())
      this.notifyLatestSubscribers(lineId, rawData)
      this.notifyGlobalSubscribers(lineId, queue.getAllData())

    } catch (error) {
      console.error('Error handling production data:', error, message)
      this.stats.errorCount++
    }
  }

  /**
   * 处理告警数据
   */
  private handleAlarmData(message: WebSocketMessage): void {
    // 告警数据处理逻辑（如果需要）
    console.log('Received alarm:', message.data)
  }

  /**
   * 处理系统状态
   */
  private handleSystemStatus(message: WebSocketMessage): void {
    // 系统状态处理逻辑（如果需要）
    console.log('Received system status:', message.data)
  }

  /**
   * 获取或创建数据队列
   */
  private getOrCreateQueue(lineId: string): DataQueue {
    if (!this.dataQueues.has(lineId)) {
      this.dataQueues.set(lineId, new DataQueue(60))
      console.debug(`Created new data queue for line ${lineId}`)
    }
    return this.dataQueues.get(lineId)!
  }

  /**
   * 通知数据订阅者
   */
  private notifySubscribers(lineId: string, data: ProductionLineData[]): void {
    const subscribers = this.dataSubscribers.get(lineId)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in data subscriber for line ${lineId}:`, error)
        }
      })
    }
  }

  /**
   * 通知最新数据订阅者
   */
  private notifyLatestSubscribers(lineId: string, data: ProductionLineData): void {
    const subscribers = this.latestDataSubscribers.get(lineId)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in latest data subscriber for line ${lineId}:`, error)
        }
      })
    }
  }

  /**
   * 通知全局订阅者
   */
  private notifyGlobalSubscribers(lineId: string, data: ProductionLineData[]): void {
    this.globalSubscribers.forEach(callback => {
      try {
        callback(lineId, data)
      } catch (error) {
        console.error(`Error in global subscriber:`, error)
      }
    })
  }
}

// 导出单例实例
export const realtimeDataService = RealtimeDataService.getInstance()