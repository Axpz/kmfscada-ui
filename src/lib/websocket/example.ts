/**
 * WebSocket Manager 使用示例
 */

import { wsManager, WebSocketMessage } from './WebSocketManager'

// 示例：如何使用 WebSocket Manager
export function exampleUsage() {
  
  // 1. 连接到 WebSocket 服务器
  wsManager.connect('ws://localhost:8080')
    .then(() => {
      console.log('Successfully connected!')
    })
    .catch(error => {
      console.error('Connection failed:', error)
    })

  // 2. 订阅连接状态变化
  const unsubscribeStatus = wsManager.onStatusChange((status) => {
    console.log('Connection status:', status)
    
    // 根据状态更新 UI
    switch (status) {
      case 'connected':
        console.log('✅ Connected to server')
        break
      case 'connecting':
        console.log('🔄 Connecting...')
        break
      case 'reconnecting':
        console.log('🔄 Reconnecting...')
        break
      case 'error':
        console.log('❌ Connection error')
        break
      case 'disconnected':
        console.log('⚪ Disconnected')
        break
    }
  })

  // 3. 订阅特定类型的消息
  const unsubscribeProductionData = wsManager.subscribe('production_data', (message) => {
    console.log('Received production data:', message.data)
    
    // 处理生产数据
    const productionData = message.data
    console.log(`Line ${productionData.production_line_id}: Temperature = ${productionData.body_temperatures}`)
  })

  // 4. 订阅告警消息
  const unsubscribeAlarms = wsManager.subscribe('alarm', (message) => {
    console.log('🚨 Alarm received:', message.data)
    
    // 处理告警
    const alarm = message.data
    console.log(`Alarm on line ${alarm.production_line_id}: ${alarm.message}`)
  })

  // 5. 订阅所有消息（用于调试）
  const unsubscribeAll = wsManager.subscribe('*', (message) => {
    console.log('📨 All messages:', message.type, message.data)
  })

  // 6. 发送消息到服务器
  const sendHeartbeat = () => {
    const heartbeat: WebSocketMessage = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      data: { client_id: 'dashboard-client' }
    }
    
    wsManager.send(heartbeat)
  }

  // 每30秒发送心跳
  const heartbeatInterval = setInterval(sendHeartbeat, 30000)

  // 7. 清理函数（在组件卸载时调用）
  const cleanup = () => {
    // 取消所有订阅
    unsubscribeStatus()
    unsubscribeProductionData()
    unsubscribeAlarms()
    unsubscribeAll()
    
    // 停止心跳
    clearInterval(heartbeatInterval)
    
    // 断开连接
    wsManager.disconnect()
  }

  // 返回清理函数
  return cleanup
}

// 示例：React Hook 中的使用模式
export function useWebSocketExample() {
  // 这是在 React Hook 中使用的示例模式
  
  /*
  useEffect(() => {
    // 连接
    wsManager.connect('ws://localhost:8080')

    // 订阅状态
    const unsubscribeStatus = wsManager.onStatusChange(setConnectionStatus)
    
    // 订阅数据
    const unsubscribeData = wsManager.subscribe('production_data', handleProductionData)

    // 清理
    return () => {
      unsubscribeStatus()
      unsubscribeData()
    }
  }, [])
  */
}

// 示例：错误处理
export function handleWebSocketErrors() {
  wsManager.onStatusChange((status) => {
    if (status === 'error') {
      // 显示错误提示
      console.error('WebSocket connection error')
      
      // 可以显示重连按钮
      showReconnectButton()
    }
  })
}

function showReconnectButton() {
  // 在 UI 中显示重连按钮
  console.log('Showing reconnect button...')
  
  // 用户点击重连时
  const handleReconnect = () => {
    wsManager.reconnect()
  }
}

// 示例：生产数据处理
export function handleProductionData(message: WebSocketMessage) {
  const data = message.data
  
  // 验证数据格式
  if (!data.production_line_id || !data.timestamp) {
    console.warn('Invalid production data format:', data)
    return
  }

  // 转换数据格式
  const transformedData = {
    lineId: data.production_line_id,
    timestamp: new Date(data.timestamp).getTime(),
    temperatures: {
      body: data.body_temperatures || [],
      flange: data.flange_temperatures || [],
      mold: data.mold_temperatures || []
    },
    motors: {
      screwSpeed: data.screw_motor_speed || 0,
      tractionSpeed: data.traction_motor_speed || 0,
      spindleCurrent: data.main_spindle_current || 0
    },
    quality: {
      diameter: data.real_time_diameter || 0,
      length: data.total_length_produced || 0
    },
    chemistry: {
      fluoride: data.fluoride_ion_concentration || 0
    }
  }

  console.log('Transformed production data:', transformedData)
  return transformedData
}