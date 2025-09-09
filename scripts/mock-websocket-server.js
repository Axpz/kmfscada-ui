/**
 * 模拟 WebSocket 服务器
 * 用于测试 WebSocket Manager
 * 
 * 运行方式: node scripts/mock-websocket-server.js
 */

const WebSocket = require('ws')

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ 
  port: 8080,
  perMessageDeflate: false
})

console.log('🚀 Mock WebSocket Server started on ws://localhost:8080')

// 生成模拟生产数据
function generateMockProductionData(lineId = '1') {
  return {
    type: 'production_data',
    timestamp: new Date().toISOString(),
    data: {
      production_line_id: lineId,
      production_batch_number: `BATCH-${lineId}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      material_batch_number: `MAT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      
      // 温度数据 (°C)
      body_temperatures: Array.from({ length: 4 }, () => 
        Math.round((180 + Math.random() * 40) * 10) / 10
      ),
      flange_temperatures: Array.from({ length: 2 }, () => 
        Math.round((160 + Math.random() * 30) * 10) / 10
      ),
      mold_temperatures: Array.from({ length: 2 }, () => 
        Math.round((200 + Math.random() * 50) * 10) / 10
      ),

      // 电机数据
      screw_motor_speed: Math.round((50 + Math.random() * 100) * 10) / 10,
      traction_motor_speed: Math.round((5 + Math.random() * 15) * 10) / 10,
      main_spindle_current: Math.round((15 + Math.random() * 10) * 10) / 10,

      // 质量数据
      real_time_diameter: Math.round((20 + Math.random() * 5) * 1000) / 1000,
      total_length_produced: Math.round((1000 + Math.random() * 5000) * 10) / 10,

      // 化学数据
      fluoride_ion_concentration: Math.round((0.5 + Math.random() * 2) * 100) / 100,
    }
  }
}

// 生成模拟告警数据
function generateMockAlarm() {
  const alarmTypes = [
    '实时直径超出上限',
    '实时直径超出下限', 
    '机身温度过高',
    '法兰温度异常',
    '模具温度过高',
    '螺杆电机转速异常',
    '牵引机速度异常',
    '氟离子浓度超标',
    '主轴电流过大'
  ]

  const lines = ['1', '2', '3', '4', '5', '6', '7', '8']

  return {
    type: 'alarm',
    timestamp: new Date().toISOString(),
    data: {
      id: `alarm-${Date.now()}`,
      production_line_id: lines[Math.floor(Math.random() * lines.length)],
      message: alarmTypes[Math.floor(Math.random() * alarmTypes.length)],
      current_value: Math.round((20 + Math.random() * 10) * 100) / 100,
      acknowledged: false,
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }
  }
}

// 生成系统状态数据
function generateSystemStatus() {
  return {
    type: 'system_status',
    timestamp: new Date().toISOString(),
    data: {
      server_time: new Date().toISOString(),
      connected_clients: wss.clients.size,
      system_load: Math.random() * 100,
      memory_usage: Math.random() * 100,
      uptime: Date.now()
    }
  }
}

// 客户端连接管理
const clients = new Map()

wss.on('connection', function connection(ws, req) {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  clients.set(ws, {
    id: clientId,
    connectedAt: new Date(),
    ip: req.socket.remoteAddress
  })

  console.log(`📱 Client connected: ${clientId} (${clients.size} total clients)`)

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: new Date().toISOString(),
    data: {
      client_id: clientId,
      server_version: '1.0.0',
      message: 'Connected to Mock SCADA WebSocket Server'
    }
  }))

  // 为每个客户端设置数据发送定时器
  const productionDataInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      // 随机发送1-3条生产线数据
      const lineCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < lineCount; i++) {
        const lineId = String(Math.floor(Math.random() * 8) + 1)
        const data = generateMockProductionData(lineId)
        ws.send(JSON.stringify(data))
      }
    }
  }, 2000) // 每2秒发送生产数据

  // 随机发送告警（概率较低）
  const alarmInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN && Math.random() < 0.1) { // 10% 概率
      const alarm = generateMockAlarm()
      ws.send(JSON.stringify(alarm))
    }
  }, 5000) // 每5秒检查是否发送告警

  // 定期发送系统状态
  const statusInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const status = generateSystemStatus()
      ws.send(JSON.stringify(status))
    }
  }, 30000) // 每30秒发送系统状态

  // 处理客户端消息
  ws.on('message', function message(data) {
    try {
      const message = JSON.parse(data.toString())
      console.log(`📨 Received from ${clientId}:`, message.type)

      // 处理心跳
      if (message.type === 'heartbeat') {
        ws.send(JSON.stringify({
          type: 'heartbeat_ack',
          timestamp: new Date().toISOString(),
          data: {
            client_id: clientId,
            server_time: new Date().toISOString()
          }
        }))
      }

      // 处理数据请求
      if (message.type === 'request_data') {
        const lineId = message.data?.line_id || '1'
        const data = generateMockProductionData(lineId)
        ws.send(JSON.stringify(data))
      }

      // 处理告警确认
      if (message.type === 'acknowledge_alarm') {
        console.log(`✅ Alarm acknowledged: ${message.data?.alarm_id}`)
        ws.send(JSON.stringify({
          type: 'alarm_acknowledged',
          timestamp: new Date().toISOString(),
          data: {
            alarm_id: message.data?.alarm_id,
            acknowledged_by: clientId,
            acknowledged_at: new Date().toISOString()
          }
        }))
      }

    } catch (error) {
      console.error(`❌ Error parsing message from ${clientId}:`, error)
    }
  })

  // 处理连接关闭
  ws.on('close', function close(code, reason) {
    console.log(`📱 Client disconnected: ${clientId} (code: ${code}, reason: ${reason})`)
    clients.delete(ws)
    
    // 清理定时器
    clearInterval(productionDataInterval)
    clearInterval(alarmInterval)
    clearInterval(statusInterval)
  })

  // 处理连接错误
  ws.on('error', function error(err) {
    console.error(`❌ WebSocket error for ${clientId}:`, err)
  })
})

// 服务器错误处理
wss.on('error', function error(err) {
  console.error('❌ WebSocket Server error:', err)
})

// 优雅关闭
process.on('SIGINT', function() {
  console.log('\n🛑 Shutting down WebSocket server...')
  
  // 通知所有客户端服务器即将关闭
  wss.clients.forEach(function each(ws) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'server_shutdown',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Server is shutting down',
          reason: 'maintenance'
        }
      }))
      ws.close(1001, 'Server shutdown')
    }
  })

  wss.close(function() {
    console.log('✅ WebSocket server closed')
    process.exit(0)
  })
})

// 定期打印服务器状态
setInterval(() => {
  console.log(`📊 Server Status: ${clients.size} connected clients`)
}, 60000) // 每分钟打印一次

console.log('📋 Available message types:')
console.log('  - production_data: Real-time production data')
console.log('  - alarm: System alarms')
console.log('  - system_status: Server status')
console.log('  - heartbeat: Client heartbeat')
console.log('  - welcome: Connection welcome message')
console.log('')
console.log('💡 Send heartbeat message to test: {"type":"heartbeat","data":{"client_id":"test"}}')