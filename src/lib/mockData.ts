import type {
  ProductionDataPoint,
  User,
  AlarmRecord,
  DiameterAlarmConfig,
  LoginRecord,
  OperationLog
} from '@/types'

// Mock 生产数据生成器
export function generateMockProductionData(): ProductionDataPoint[] {
  const lines = ['1', '2', '3', '4', '5', '6', '7', '8']
  const now = new Date()

  return lines.map((lineId, index) => ({
    id: `prod-${lineId}-${Date.now()}`,
    timestamp: new Date(now.getTime() - index * 1000).toISOString(),
    production_line_id: lineId,
    production_batch_number: `BATCH-${lineId}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    material_batch_number: `MAT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,

    // 温度数据 (°C) - 模拟正常工作温度范围
    body_temperatures: Array.from({ length: 4 }, () =>
      Math.round((180 + Math.random() * 40) * 10) / 10
    ),
    flange_temperatures: Array.from({ length: 2 }, () =>
      Math.round((160 + Math.random() * 30) * 10) / 10
    ),
    mold_temperatures: Array.from({ length: 2 }, () =>
      Math.round((200 + Math.random() * 50) * 10) / 10
    ),

    // 速度数据
    screw_motor_speed: Math.round((50 + Math.random() * 100) * 10) / 10,
    traction_motor_speed: Math.round((5 + Math.random() * 15) * 10) / 10,

    // 测量数据
    real_time_diameter: Math.round((20 + Math.random() * 5) * 1000) / 1000,
    total_length_produced: Math.round((1000 + Math.random() * 5000) * 10) / 10,

    // 其他数据
    fluoride_ion_concentration: Math.round((0.5 + Math.random() * 2) * 100) / 100,
    main_spindle_current: Math.round((15 + Math.random() * 10) * 10) / 10,
  }))
}

// Mock 用户数据
export function generateMockUsers(): User[] {
  return [
    {
      id: '1',
      username: 'admin',
      email: 'admin@kmf.com',
      role: 'superadmin',
      created_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@kmf.com',
      role: 'admin',
      created_at: '2024-01-02T00:00:00Z',
      last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      username: 'operator1',
      email: 'operator1@kmf.com',
      role: 'user',
      created_at: '2024-01-03T00:00:00Z',
      last_sign_in_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4',
      username: 'operator2',
      email: 'operator2@kmf.com',
      role: 'user',
      created_at: '2024-01-04T00:00:00Z',
      last_sign_in_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ]
}

// Mock 报警记录
export function generateMockAlarmHistory(): AlarmRecord[] {
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

  return Array.from({ length: 20 }, (_, index) => ({
    id: `alarm-${index + 1}`,
    timestamp: new Date(Date.now() - index * 300000).toISOString(), // 每5分钟一个报警
    production_line_id: lines[Math.floor(Math.random() * lines.length)]!,
    message: alarmTypes[Math.floor(Math.random() * alarmTypes.length)]!,
    current_value: Math.round((20 + Math.random() * 10) * 100) / 100,
    acknowledged: Math.random() > 0.3, // 70% 的报警已确认
  }))
}

// Mock 报警规则配置
export function generateMockAlarmRules(): DiameterAlarmConfig[] {
  const lines = ['1', '2', '3', '4', '5', '6', '7', '8']

  return lines.map(lineId => ({
    production_line_id: lineId,
    upper_limit: 25.0 + Math.random() * 2,
    lower_limit: 18.0 + Math.random() * 2,
    enabled: lineId > '4', // 80% 的规则启用
  }))
}

// Mock 登录记录
export function generateMockLoginRecords(): LoginRecord[] {
  const users = ['admin', 'manager', 'operator1', 'operator2']
  const locations = ['北京', '上海', '深圳', '广州', '杭州']
  const devices = ['Chrome/Windows', 'Safari/macOS', 'Firefox/Linux', 'Edge/Windows']

  return Array.from({ length: 50 }, (_, index) => ({
    id: `login-${index + 1}`,
    user_name: users[Math.floor(Math.random() * users.length)]!,
    ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    location: locations[Math.floor(Math.random() * locations.length)]!,
    device_info: devices[Math.floor(Math.random() * devices.length)]!,
    timestamp: new Date(Date.now() - index * 600000).toISOString(), // 每10分钟一个登录
  }))
}

// Mock 操作日志
export function generateMockOperationLogs(): OperationLog[] {
  const users = ['admin', 'manager', 'operator1', 'operator2']
  const operations = [
    '用户登录',
    '数据导出',
    '报警确认',
    '参数修改',
    '用户创建',
    '用户删除',
    '规则更新',
    '系统配置'
  ]
  const locations = [
    '数据看板',
    '用户管理',
    '报警中心',
    '统计分析',
    '数据导出',
    '系统设置'
  ]

  return Array.from({ length: 100 }, (_, index) => ({
    id: `op-${index + 1}`,
    timestamp: new Date(Date.now() - index * 300000).toISOString(),
    user_name: users[Math.floor(Math.random() * users.length)]!,
    operation_type: operations[Math.floor(Math.random() * operations.length)]!,
    operation_location: locations[Math.floor(Math.random() * locations.length)]!,
    operation_result: Math.random() > 0.1 ? 'success' : 'failure', // 90% 成功率
  }))
}

// Mock 历史数据生成器
export function generateMockHistoricalData(
  productionLineId: string,
  startTime: string,
  endTime: string
): ProductionDataPoint[] {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const interval = 60000 // 1分钟间隔
  const points: ProductionDataPoint[] = []

  for (let time = start.getTime(); time <= end.getTime(); time += interval) {
    points.push({
      id: `hist-${productionLineId}-${time}`,
      timestamp: new Date(time).toISOString(),
      production_line_id: productionLineId,
      production_batch_number: `BATCH-${productionLineId}-001`,
      material_batch_number: `MAT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,

      body_temperatures: Array.from({ length: 4 }, () =>
        Math.round((180 + Math.random() * 40) * 10) / 10
      ),
      flange_temperatures: Array.from({ length: 2 }, () =>
        Math.round((160 + Math.random() * 30) * 10) / 10
      ),
      mold_temperatures: Array.from({ length: 2 }, () =>
        Math.round((200 + Math.random() * 50) * 10) / 10
      ),

      screw_motor_speed: Math.round((50 + Math.random() * 100) * 10) / 10,
      traction_motor_speed: Math.round((5 + Math.random() * 15) * 10) / 10,

      real_time_diameter: Math.round((20 + Math.random() * 5) * 1000) / 1000,
      total_length_produced: Math.round((1000 + Math.random() * 5000) * 10) / 10,

      fluoride_ion_concentration: Math.round((0.5 + Math.random() * 2) * 100) / 100,
      main_spindle_current: Math.round((15 + Math.random() * 10) * 10) / 10,
    })
  }

  return points
}

// 实时数据更新模拟器
export class MockDataSimulator {
  private static instance: MockDataSimulator
  private productionData: ProductionDataPoint[] = []
  private updateInterval: NodeJS.Timeout | null = null
  private subscribers: ((data: ProductionDataPoint[]) => void)[] = []

  static getInstance(): MockDataSimulator {
    if (!MockDataSimulator.instance) {
      MockDataSimulator.instance = new MockDataSimulator()
    }
    return MockDataSimulator.instance
  }

  start() {
    this.productionData = generateMockProductionData()

    this.updateInterval = setInterval(() => {
      // 更新现有数据
      this.productionData = this.productionData.map(item => ({
        ...item,
        timestamp: new Date().toISOString(),

        // 模拟数据变化
        body_temperatures: item.body_temperatures.map(temp =>
          Math.round((temp + (Math.random() - 0.5) * 2) * 10) / 10
        ),
        flange_temperatures: item.flange_temperatures.map(temp =>
          Math.round((temp + (Math.random() - 0.5) * 2) * 10) / 10
        ),
        mold_temperatures: item.mold_temperatures.map(temp =>
          Math.round((temp + (Math.random() - 0.5) * 2) * 10) / 10
        ),

        screw_motor_speed: Math.round((item.screw_motor_speed + (Math.random() - 0.5) * 5) * 10) / 10,
        traction_motor_speed: Math.round((item.traction_motor_speed + (Math.random() - 0.5) * 1) * 10) / 10,

        real_time_diameter: Math.round((item.real_time_diameter + (Math.random() - 0.5) * 0.1) * 1000) / 1000,
        total_length_produced: item.total_length_produced + Math.random() * 10,

        fluoride_ion_concentration: Math.round((item.fluoride_ion_concentration + (Math.random() - 0.5) * 0.1) * 100) / 100,
        main_spindle_current: Math.round((item.main_spindle_current + (Math.random() - 0.5) * 1) * 10) / 10,
      }))

      // 通知所有订阅者
      this.subscribers.forEach(callback => callback(this.productionData))
    }, 5000) // 每5秒更新一次
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  subscribe(callback: (data: ProductionDataPoint[]) => void) {
    this.subscribers.push(callback)
    // 立即发送当前数据
    if (this.productionData.length > 0) {
      callback(this.productionData)
    }
  }

  unsubscribe(callback: (data: ProductionDataPoint[]) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback)
  }

  getCurrentData(): ProductionDataPoint[] {
    return this.productionData
  }
}