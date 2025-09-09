# 数据服务集成指南

## 🎯 概述

`RealtimeDataService` 是一个强大的数据管理层，它：
- 订阅 WebSocket 消息并自动缓存数据
- 为每条生产线维护 60 个数据点的滑动窗口
- 提供简洁的 React Hook 接口
- 支持多种订阅模式（单线、多线、全局）

## 🏗️ 架构图

```
WebSocket Server → WebSocketManager → RealtimeDataService → React Hooks → Components
                                           ↓
                                    DataQueue (60 points per line)
                                           ↓
                                    Subscribers (Components)
```

## 🚀 快速开始

### 1. 基础使用

```typescript
import { useRealtimeData } from '@/hooks/useRealtimeData'

function MyComponent() {
  const { data, latest, loading, error } = useRealtimeData('1') // 生产线1
  
  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error}</div>
  
  return (
    <div>
      <h3>生产线1 - 最新数据</h3>
      {latest && (
        <div>
          <p>螺杆转速: {latest.螺杆转速} RPM</p>
          <p>实时直径: {latest.实时直径} mm</p>
          <p>机身温度1: {latest.机身1}°C</p>
        </div>
      )}
      
      <h3>历史数据 ({data.length} 个点)</h3>
      {/* 渲染图表或列表 */}
    </div>
  )
}
```

### 2. 多生产线监控

```typescript
import { useMultiLineRealtimeData } from '@/hooks/useRealtimeData'

function MultiLineMonitor() {
  const { dataMap, latestMap, loading } = useMultiLineRealtimeData(['1', '2', '3', '4'])
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {['1', '2', '3', '4'].map(lineId => {
        const latest = latestMap.get(lineId)
        return (
          <div key={lineId}>
            <h4>生产线 {lineId}</h4>
            {latest ? (
              <p>螺杆转速: {latest.螺杆转速} RPM</p>
            ) : (
              <p>无数据</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### 3. 服务状态监控

```typescript
import { useDataServiceStats } from '@/hooks/useRealtimeData'

function ServiceMonitor() {
  const { 
    isRunning, 
    messageCount, 
    errorCount, 
    activeLines,
    startService,
    stopService 
  } = useDataServiceStats()
  
  return (
    <div>
      <p>服务状态: {isRunning ? '运行中' : '已停止'}</p>
      <p>接收消息: {messageCount}</p>
      <p>错误次数: {errorCount}</p>
      <p>活跃生产线: {activeLines}</p>
      
      <button onClick={startService} disabled={isRunning}>
        启动服务
      </button>
      <button onClick={stopService} disabled={!isRunning}>
        停止服务
      </button>
    </div>
  )
}
```

## 📋 API 参考

### RealtimeDataService

#### 核心方法

```typescript
class RealtimeDataService {
  // 初始化服务
  async initialize(): Promise<void>
  
  // 启动/停止服务
  async start(): Promise<void>
  stop(): void
  
  // 数据订阅
  subscribe(lineId: string, callback: DataSubscriber): () => void
  subscribeLatest(lineId: string, callback: LatestDataSubscriber): () => void
  subscribeGlobal(callback: GlobalSubscriber): () => void
  
  // 数据访问
  getHistoryData(lineId: string): RealTimeDataPoint[]
  getLatestData(lineId: string): RealTimeDataPoint | null
  getRecentData(lineId: string, count: number): RealTimeDataPoint[]
  getAllLatestData(): Map<string, RealTimeDataPoint | null>
  
  // 数据管理
  clearLineData(lineId: string): void
  clearAllData(): void
  
  // 统计信息
  getStats(): ServiceStats
}
```

#### 数据结构

```typescript
interface RealTimeDataPoint {
  timestamp: number           // 时间戳
  time: string               // 格式化时间
  production_line_id: string // 生产线ID
  
  // 温度数据
  机身1: number
  机身2: number
  机身3: number
  机身4: number
  法兰1: number
  法兰2: number
  模具1: number
  模具2: number
  
  // 电机数据
  螺杆转速: number
  牵引速度: number
  主轴电流: number
  
  // 质量数据
  实时直径: number
  生产长度: number
  
  // 化学数据
  氟离子浓度: number
  
  // 原始数据
  raw: ProductionDataPoint
}
```

### React Hooks

#### useRealtimeData(lineId: string)

```typescript
const {
  data,           // RealTimeDataPoint[] - 历史数据数组
  latest,         // RealTimeDataPoint | null - 最新数据点
  loading,        // boolean - 加载状态
  error,          // string | null - 错误信息
  refresh,        // () => void - 手动刷新
  clearData,      // () => void - 清空数据
  dataCount,      // number - 数据点数量
  hasData,        // boolean - 是否有数据
  isRealtime      // boolean - 是否实时连接
} = useRealtimeData('1')
```

#### useMultiLineRealtimeData(lineIds: string[])

```typescript
const {
  dataMap,        // Map<string, RealTimeDataPoint[]> - 各线数据
  latestMap,      // Map<string, RealTimeDataPoint | null> - 各线最新数据
  loading,        // boolean - 加载状态
  error,          // string | null - 错误信息
  getLineData,    // (lineId: string) => RealTimeDataPoint[]
  getLineLatest,  // (lineId: string) => RealTimeDataPoint | null
  getAllLatest,   // () => Array<{lineId: string, data: RealTimeDataPoint}>
  activeLines,    // number - 活跃生产线数
  totalDataPoints // number - 总数据点数
} = useMultiLineRealtimeData(['1', '2', '3'])
```

#### useDataServiceStats()

```typescript
const {
  stats,          // ServiceStats - 完整统计信息
  isRunning,      // boolean - 服务运行状态
  isInitialized,  // boolean - 服务初始化状态
  uptime,         // number - 运行时间(ms)
  messageCount,   // number - 接收消息数
  errorCount,     // number - 错误次数
  activeLines,    // number - 活跃生产线数
  refresh,        // () => void - 刷新统计
  autoRefresh,    // boolean - 自动刷新状态
  setAutoRefresh, // (enabled: boolean) => void
  startService,   // () => Promise<void> - 启动服务
  stopService,    // () => void - 停止服务
  clearAllData    // () => void - 清空所有数据
} = useDataServiceStats()
```

## 🔧 配置选项

### 数据队列配置

```typescript
// 默认配置
const DEFAULT_QUEUE_SIZE = 60  // 60个数据点 (约2分钟历史)

// 自定义队列大小
class DataQueue {
  constructor(maxSize: number = 60) {
    this.maxSize = maxSize
  }
}
```

### 服务配置

```typescript
// 在服务初始化时可以配置
await realtimeDataService.initialize({
  queueSize: 60,           // 队列大小
  enableValidation: true,  // 启用数据验证
  enableLogging: true      // 启用日志
})
```

## 🎨 集成到现有组件

### 1. 替换现有的 useRealTimeData

```typescript
// 旧代码
const Dashboard = () => {
  const realTimeData = useRealTimeData(lineData) // 旧的 Hook
  
  return (
    <TemperaturePanel realTimeData={realTimeData} />
  )
}

// 新代码
const Dashboard = () => {
  const [selectedLineId, setSelectedLineId] = useState('1')
  const { data: realTimeData } = useRealtimeData(selectedLineId) // 新的 Hook
  
  return (
    <TemperaturePanel realTimeData={realTimeData} />
  )
}
```

### 2. 更新组件 Props

```typescript
// 组件接口保持不变
interface TemperaturePanelProps {
  realTimeData: RealTimeDataPoint[]
}

// 组件内部逻辑不需要修改
const TemperaturePanel = ({ realTimeData }: TemperaturePanelProps) => {
  const chartData = useMemo(() => {
    return realTimeData.map((point, index) => ({
      index,
      机身1: point.机身1,
      机身2: point.机身2,
      // ... 其他字段
    }))
  }, [realTimeData])
  
  // 图表渲染逻辑保持不变
  return <LineChart data={chartData} />
}
```

### 3. 添加错误处理

```typescript
const Dashboard = () => {
  const { data, latest, loading, error } = useRealtimeData('1')
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      <TemperaturePanel realTimeData={data} />
      <MotorPanel latest={latest} />
    </div>
  )
}
```

## 🧪 测试和调试

### 1. 测试页面

访问 `/data-service-test` 页面进行完整的功能测试：
- 单生产线数据监控
- 多生产线数据概览
- 服务统计和控制
- 全局更新日志

### 2. 调试技巧

```typescript
// 启用详细日志
console.log('Service stats:', realtimeDataService.getStats())

// 监控数据更新
realtimeDataService.subscribeGlobal((lineId, data) => {
  console.log(`Line ${lineId} updated:`, data.length, 'points')
})

// 检查队列状态
const stats = realtimeDataService.getStats()
console.log('Queue utilization:', stats.queues)
```

### 3. 性能监控

```typescript
// 监控内存使用
const stats = realtimeDataService.getStats()
console.log('Memory usage:', {
  totalDataPoints: Object.values(stats.queues)
    .reduce((sum, queue) => sum + queue.size, 0),
  averageUtilization: Object.values(stats.queues)
    .reduce((sum, queue) => sum + queue.utilizationRate, 0) / Object.keys(stats.queues).length
})
```

## 🚀 部署注意事项

### 1. 生产环境配置

```typescript
// 根据环境调整配置
const queueSize = process.env.NODE_ENV === 'production' ? 120 : 60 // 生产环境更大缓存
const enableLogging = process.env.NODE_ENV !== 'production'
```

### 2. 错误监控

```typescript
// 集成错误监控服务
realtimeDataService.onError((error) => {
  // 发送到错误监控服务
  errorReporting.captureException(error)
})
```

### 3. 性能优化

```typescript
// 使用 React.memo 优化组件
const TemperaturePanel = React.memo(({ realTimeData }) => {
  // 组件逻辑
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  const prevLatest = prevProps.realTimeData[prevProps.realTimeData.length - 1]
  const nextLatest = nextProps.realTimeData[nextProps.realTimeData.length - 1]
  
  return prevLatest?.timestamp === nextLatest?.timestamp
})
```

## 📈 最佳实践

### 1. 数据订阅管理

```typescript
// ✅ 正确：在 useEffect 中管理订阅
useEffect(() => {
  const unsubscribe = realtimeDataService.subscribe(lineId, handleData)
  return unsubscribe // 自动清理
}, [lineId])

// ❌ 错误：忘记清理订阅
useEffect(() => {
  realtimeDataService.subscribe(lineId, handleData) // 内存泄漏！
}, [lineId])
```

### 2. 错误处理

```typescript
// ✅ 正确：优雅的错误处理
const { data, error } = useRealtimeData(lineId)

if (error) {
  return (
    <ErrorBoundary>
      <ErrorMessage 
        message={error} 
        onRetry={() => window.location.reload()} 
      />
    </ErrorBoundary>
  )
}

// ❌ 错误：忽略错误状态
const { data } = useRealtimeData(lineId) // 可能导致白屏
```

### 3. 性能优化

```typescript
// ✅ 正确：使用 useMemo 缓存计算结果
const chartData = useMemo(() => {
  return data.map(transformToChartFormat)
}, [data])

// ❌ 错误：每次渲染都重新计算
const chartData = data.map(transformToChartFormat) // 性能问题
```

## 🔄 迁移指南

### 从旧的 useRealTimeData 迁移

1. **替换 Hook 导入**
   ```typescript
   // 旧
   import { useRealTimeData } from '@/hooks/useRealTimeData'
   
   // 新
   import { useRealtimeData } from '@/hooks/useRealtimeData'
   ```

2. **更新 Hook 调用**
   ```typescript
   // 旧
   const realTimeData = useRealTimeData(lineData)
   
   // 新
   const { data: realTimeData } = useRealtimeData(lineId)
   ```

3. **添加错误处理**
   ```typescript
   const { data, loading, error } = useRealtimeData(lineId)
   
   if (loading) return <LoadingSpinner />
   if (error) return <ErrorMessage error={error} />
   ```

4. **移除旧的数据生成逻辑**
   ```typescript
   // 删除这些旧代码
   // - generateRealTimeDataPoint
   // - RealTimeDataQueue 类
   // - setInterval 定时器
   ```

这个数据服务为你的 SCADA 系统提供了强大而灵活的实时数据管理能力！