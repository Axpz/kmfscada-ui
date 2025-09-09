# WebSocket 最佳实践指南

## 🎯 架构概览

我们的 WebSocket 实现基于 `reconnecting-websocket` 库，提供了企业级的实时数据通信解决方案。

### 技术栈
- **前端**: Next.js 15 + TypeScript + reconnecting-websocket
- **后端**: FastAPI + WebSocket + asyncio
- **消息格式**: JSON
- **重连策略**: 指数退避 + 智能检测

## 🏗️ 前端架构

### 1. WebSocket Manager 设计

```typescript
// 核心特性
✅ 基于 reconnecting-websocket 的稳定连接
✅ 消息类型订阅系统
✅ 连接状态管理
✅ 自动心跳机制
✅ 错误处理和重连
✅ TypeScript 类型安全
```

### 2. 关键配置

```typescript
const options: WebSocketManagerOptions = {
  // reconnecting-websocket 配置
  connectionTimeout: 4000,        // 连接超时 4秒
  maxRetries: Infinity,           // 无限重连
  maxReconnectionDelay: 10000,    // 最大重连延迟 10秒
  minReconnectionDelay: 1000,     // 最小重连延迟 1秒 + 随机
  reconnectionDelayGrowFactor: 1.3, // 延迟增长因子
  minUptime: 5000,                // 最小正常运行时间 5秒
  
  // 自定义配置
  heartbeatInterval: 30000,       // 心跳间隔 30秒
  enableHeartbeat: true,          // 启用心跳
}
```

### 3. 使用模式

```typescript
// 1. 连接管理
await wsManager.connect('ws://localhost:8080')

// 2. 消息订阅
const unsubscribe = wsManager.subscribe('production_data', (message) => {
  console.log('生产数据:', message.data)
})

// 3. 状态监听
wsManager.onStatusChange((status) => {
  console.log('连接状态:', status)
})

// 4. 发送消息
wsManager.send({
  type: 'heartbeat',
  timestamp: new Date().toISOString(),
  data: { client_id: 'dashboard' }
})

// 5. 清理
unsubscribe()
wsManager.disconnect()
```

## 🚀 后端架构 (FastAPI)

### 1. 连接管理器

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_info: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        # 记录客户端信息...

    async def broadcast(self, message: dict):
        # 广播消息到所有客户端...
```

### 2. 消息处理

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    
    try:
        await manager.connect(websocket, client_id)
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_client_message(message, client_id)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
```

### 3. 数据生成器

```python
async def generate_production_data():
    """后台任务：生成模拟生产数据"""
    while True:
        for line_id in range(1, 9):
            data = generate_mock_data(line_id)
            await manager.broadcast(data)
            await asyncio.sleep(0.1)
        await asyncio.sleep(2)
```

## 📋 消息协议设计

### 1. 标准消息格式

```typescript
interface WebSocketMessage {
  type: string        // 消息类型
  timestamp: string   // ISO 8601 时间戳
  data: any          // 消息数据
}
```

### 2. 消息类型定义

```typescript
// 生产数据
{
  type: 'production_data',
  timestamp: '2024-01-01T12:00:00.000Z',
  data: {
    production_line_id: '1',
    body_temperatures: [180.5, 185.2, 190.1, 195.3],
    // ... 其他生产数据
  }
}

// 告警消息
{
  type: 'alarm',
  timestamp: '2024-01-01T12:00:00.000Z',
  data: {
    id: 'alarm-123',
    production_line_id: '1',
    message: '实时直径超出上限',
    severity: 'high'
  }
}

// 心跳消息
{
  type: 'heartbeat',
  timestamp: '2024-01-01T12:00:00.000Z',
  data: {
    client_id: 'dashboard-client'
  }
}
```

## 🔧 部署配置

### 1. 开发环境

```bash
# 启动后端 WebSocket 服务器
npm run ws-server

# 启动前端开发服务器
npm run dev

# 或者同时启动
npm run dev:full
```

### 2. 生产环境配置

```typescript
// 环境变量
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws
NEXT_PUBLIC_API_URL=https://api.your-domain.com

// WebSocket 配置
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://api.your-domain.com/ws'
  : 'ws://localhost:8080'
```

### 3. Nginx 代理配置

```nginx
# WebSocket 代理
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket 特定配置
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

## 🛡️ 错误处理策略

### 1. 前端错误处理

```typescript
// 连接错误
wsManager.onStatusChange((status) => {
  switch (status) {
    case 'error':
      showErrorNotification('连接失败，正在重试...')
      break
    case 'reconnecting':
      showInfoNotification('连接中断，正在重连...')
      break
    case 'connected':
      hideNotifications()
      break
  }
})

// 消息错误
wsManager.subscribe('*', (message) => {
  try {
    validateMessage(message)
    processMessage(message)
  } catch (error) {
    console.error('消息处理错误:', error)
    reportError(error, message)
  }
})
```

### 2. 后端错误处理

```python
async def handle_client_message(message: dict, client_id: str):
    try:
        message_type = message.get("type")
        
        if not message_type:
            raise ValueError("Missing message type")
            
        # 处理消息...
        
    except Exception as e:
        logging.error(f"Message handling error for {client_id}: {e}")
        
        # 发送错误响应
        error_response = {
            "type": "error",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "message": str(e),
                "original_message": message
            }
        }
        await manager.send_personal_message(error_response, client_id)
```

## 📊 性能优化

### 1. 前端优化

```typescript
// 消息批处理
class MessageBatcher {
  private batch: WebSocketMessage[] = []
  private timer: NodeJS.Timeout | null = null
  
  addMessage(message: WebSocketMessage) {
    this.batch.push(message)
    
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.processBatch()
        this.batch = []
        this.timer = null
      }, 100) // 100ms 批处理间隔
    }
  }
}

// React 组件优化
const ProductionData = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return processProductionData(data)
  }, [data])
  
  return <Chart data={processedData} />
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.data.timestamp === nextProps.data.timestamp
})
```

### 2. 后端优化

```python
# 消息压缩
import gzip
import json

async def send_compressed_message(websocket: WebSocket, message: dict):
    json_data = json.dumps(message)
    compressed_data = gzip.compress(json_data.encode())
    await websocket.send_bytes(compressed_data)

# 连接池管理
class ConnectionPool:
    def __init__(self, max_connections=1000):
        self.max_connections = max_connections
        self.connections = {}
    
    async def add_connection(self, client_id: str, websocket: WebSocket):
        if len(self.connections) >= self.max_connections:
            # 移除最旧的连接
            oldest_client = min(self.connections.keys())
            await self.remove_connection(oldest_client)
        
        self.connections[client_id] = websocket
```

## 🧪 测试策略

### 1. 单元测试

```typescript
// WebSocket Manager 测试
describe('WebSocketManager', () => {
  let wsManager: WebSocketManager
  let mockServer: MockWebSocketServer
  
  beforeEach(() => {
    mockServer = new MockWebSocketServer(8080)
    wsManager = new WebSocketManager()
  })
  
  test('should connect successfully', async () => {
    await wsManager.connect('ws://localhost:8080')
    expect(wsManager.isConnected()).toBe(true)
  })
  
  test('should handle reconnection', async () => {
    await wsManager.connect('ws://localhost:8080')
    mockServer.close()
    
    // 等待重连
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(wsManager.getStatus()).toBe('reconnecting')
  })
})
```

### 2. 集成测试

```typescript
// 端到端测试
test('should receive production data', async () => {
  const messages: WebSocketMessage[] = []
  
  wsManager.subscribe('production_data', (message) => {
    messages.push(message)
  })
  
  await wsManager.connect('ws://localhost:8080')
  
  // 等待接收消息
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  expect(messages.length).toBeGreaterThan(0)
  expect(messages[0].type).toBe('production_data')
})
```

## 📈 监控和日志

### 1. 前端监控

```typescript
// 连接质量监控
class ConnectionMonitor {
  private metrics = {
    connectTime: 0,
    messageCount: 0,
    errorCount: 0,
    reconnectCount: 0
  }
  
  trackConnection() {
    wsManager.onStatusChange((status) => {
      if (status === 'connected') {
        this.metrics.connectTime = Date.now()
      } else if (status === 'reconnecting') {
        this.metrics.reconnectCount++
      }
    })
  }
  
  getMetrics() {
    return { ...this.metrics }
  }
}
```

### 2. 后端监控

```python
# 连接统计
class ConnectionStats:
    def __init__(self):
        self.total_connections = 0
        self.active_connections = 0
        self.messages_sent = 0
        self.errors = 0
    
    def track_connection(self):
        self.total_connections += 1
        self.active_connections += 1
    
    def track_disconnect(self):
        self.active_connections -= 1
    
    def get_stats(self):
        return {
            "total_connections": self.total_connections,
            "active_connections": self.active_connections,
            "messages_sent": self.messages_sent,
            "errors": self.errors
        }

stats = ConnectionStats()

# 健康检查端点
@app.get("/health/websocket")
async def websocket_health():
    return stats.get_stats()
```

## 🔒 安全考虑

### 1. 认证和授权

```typescript
// JWT Token 认证
wsManager.connect('ws://localhost:8080', {
  headers: {
    'Authorization': `Bearer ${getJWTToken()}`
  }
})

// 消息签名验证
const signMessage = (message: WebSocketMessage, secret: string) => {
  const signature = hmacSHA256(JSON.stringify(message), secret)
  return { ...message, signature }
}
```

### 2. 数据验证

```python
from pydantic import BaseModel, ValidationError

class ProductionDataMessage(BaseModel):
    type: str
    timestamp: str
    data: dict

async def validate_message(raw_message: str) -> ProductionDataMessage:
    try:
        message_dict = json.loads(raw_message)
        return ProductionDataMessage(**message_dict)
    except (json.JSONDecodeError, ValidationError) as e:
        raise ValueError(f"Invalid message format: {e}")
```

## 🎯 总结

### 优势
1. **稳定可靠**: 基于成熟的 reconnecting-websocket 库
2. **类型安全**: 完整的 TypeScript 类型定义
3. **易于使用**: 简洁的 API 设计
4. **高性能**: 优化的消息处理和连接管理
5. **可扩展**: 灵活的订阅系统和配置选项

### 适用场景
- ✅ 实时数据监控系统
- ✅ 工业 SCADA 系统
- ✅ 金融交易系统
- ✅ 在线协作工具
- ✅ 游戏实时通信

### 下一步
1. 集成到现有的 Dashboard 组件
2. 实现数据存储和缓存层
3. 添加更多的消息类型支持
4. 完善错误处理和用户体验
5. 部署到生产环境并监控性能

这个 WebSocket 实现为你的 SCADA 系统提供了企业级的实时通信基础设施！