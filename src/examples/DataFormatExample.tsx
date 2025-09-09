import React from 'react'
import { useSensorDataHistorical } from '@/hooks/useSensorData'
import type { SensorDataListResponse } from '@/lib/api-sensor-data'

/**
 * allHistoricalData 数据格式示例
 */
export const DataFormatExample: React.FC = () => {
  const { allHistoricalData } = useSensorDataHistorical(
    ['LINE_001', 'LINE_002'],
    '2024-01-01T00:00:00Z',
    '2024-01-02T00:00:00Z'
  )

  // allHistoricalData 的数据格式说明
  const dataFormatExplanation = {
    type: "SensorDataListResponse[]",
    description: "数组，包含多个 SensorDataListResponse 对象",
    structure: [
      {
        index: 0,
        type: "SensorDataListResponse",
        description: "第一条生产线的数据响应",
        properties: {
          items: {
            type: "SensorData[]",
            description: "传感器数据数组",
            example: [
              {
                timestamp: "2024-01-01T10:00:00Z",
                line_id: "LINE_001",
                component_id: "winder",
                batch_product_number: "BATCH_20240101_001",
                current_length: 150.5,
                target_length: 200.0,
                diameter: 12.5,
                fluoride_concentration: 0.8,
                temp_body_zone1: 180.2,
                temp_body_zone2: 182.1,
                temp_body_zone3: 179.8,
                temp_body_zone4: 181.5,
                temp_flange_zone1: 175.3,
                temp_flange_zone2: 176.8,
                temp_mold_zone1: 185.2,
                temp_mold_zone2: 184.7,
                current_body_zone1: 15.2,
                current_body_zone2: 15.8,
                current_body_zone3: 14.9,
                current_body_zone4: 15.5,
                current_flange_zone1: 12.3,
                current_flange_zone2: 12.7,
                current_mold_zone1: 18.1,
                current_mold_zone2: 17.9,
                motor_screw_speed: 1200.0,
                motor_screw_torque: 45.2,
                motor_current: 25.8,
                motor_traction_speed: 15.5,
                motor_vacuum_speed: 8.2,
                winder_speed: 200.0,
                winder_torque: 12.5,
                winder_layer_count: 15,
                winder_tube_speed: 180.0,
                winder_tube_count: 2,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z"
              }
            ]
          },
          total: {
            type: "number",
            description: "总记录数",
            example: 1440
          },
          page: {
            type: "number", 
            description: "当前页码",
            example: 1
          },
          size: {
            type: "number",
            description: "每页大小",
            example: 100
          }
        }
      }
    ]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">allHistoricalData 数据格式</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">类型定义：</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`type allHistoricalData = SensorDataListResponse[]

interface SensorDataListResponse {
  items: SensorData[]
  total: number
  page: number
  size: number
}

interface SensorData {
  timestamp: string
  line_id: string
  component_id: string
  
  // 生产业务数据
  batch_product_number?: string
  current_length?: number
  target_length?: number
  diameter?: number
  fluoride_concentration?: number

  // 温度传感器组
  temp_body_zone1?: number
  temp_body_zone2?: number
  temp_body_zone3?: number
  temp_body_zone4?: number
  temp_flange_zone1?: number
  temp_flange_zone2?: number
  temp_mold_zone1?: number
  temp_mold_zone2?: number

  // 电流传感器组
  current_body_zone1?: number
  current_body_zone2?: number
  current_body_zone3?: number
  current_body_zone4?: number
  current_flange_zone1?: number
  current_flange_zone2?: number
  current_mold_zone1?: number
  current_mold_zone2?: number

  // 电机参数
  motor_screw_speed?: number
  motor_screw_torque?: number
  motor_current?: number
  motor_traction_speed?: number
  motor_vacuum_speed?: number

  // 收卷机
  winder_speed?: number
  winder_torque?: number
  winder_layer_count?: number
  winder_tube_speed?: number
  winder_tube_count?: number

  // 时间戳字段
  created_at?: string
  updated_at?: string
}`}
        </pre>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">实际数据结构示例：</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`allHistoricalData = [
  {
    items: [
      {
        timestamp: "2024-01-01T10:00:00Z",
        line_id: "LINE_001",
        component_id: "winder",
        diameter: 12.5,
        temp_body_zone1: 180.2,
        current_body_zone1: 15.2,
        motor_screw_speed: 1200.0,
        winder_speed: 200.0,
        // ... 其他字段
      },
      {
        timestamp: "2024-01-01T10:01:00Z",
        line_id: "LINE_001", 
        component_id: "winder",
        diameter: 12.6,
        temp_body_zone1: 180.5,
        // ... 其他字段
      }
      // ... 更多数据点
    ],
    total: 1440,
    page: 1,
    size: 100
  },
  {
    items: [
      {
        timestamp: "2024-01-01T10:00:00Z",
        line_id: "LINE_002",
        component_id: "winder", 
        diameter: 12.3,
        // ... 其他字段
      }
      // ... 更多数据点
    ],
    total: 1440,
    page: 1,
    size: 100
  }
]`}
        </pre>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">使用示例：</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`// 获取所有数据点
const allDataPoints = allHistoricalData.flatMap(response => response.items)

// 按生产线分组
const dataByLine = allHistoricalData.reduce((acc, response, index) => {
  const lineId = selectedLineIds[index]
  acc[lineId] = response.items
  return acc
}, {} as Record<string, SensorData[]>)

// 获取特定字段的数据
const diameterData = allDataPoints.map(item => ({
  timestamp: new Date(item.timestamp).getTime(),
  value: item.diameter,
  line_id: item.line_id
}))

// 统计信息
const totalDataPoints = allHistoricalData.reduce(
  (sum, response) => sum + response.items.length, 
  0
)`}
        </pre>
      </div>
    </div>
  )
}

export default DataFormatExample
