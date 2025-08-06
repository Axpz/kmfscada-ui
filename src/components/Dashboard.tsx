'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useProductionData } from '@/hooks/useApi'
import { ProductionDataPoint } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  AlertCircle,
  Activity,
  Thermometer,
  Gauge,
  Factory,
  Ruler,
  Camera,
  Play,
  Pause,
  Settings,
  Package,
  Droplet,
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ScrewSpeedGauge } from '@/components/ui/screw-speed-gauge'
import { TractionSpeedGauge } from '@/components/ui/traction-speed-gauge'
import { SpindleCurrentGauge } from '@/components/ui/spindle-current-gauge'

// 数据接口
interface RealTimeDataPoint {
  timestamp: number
  time: string
  机身1: number
  机身2: number
  机身3: number
  机身4: number
  法兰1: number
  法兰2: number
  模具1: number
  模具2: number
  螺杆转速: number
  牵引速度: number
  主轴电流: number
  实时直径: number
  生产长度: number
  氟离子浓度: number
}

interface CameraData {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'warning'
  resolution: string
  fps: number
  lastUpdate: string
  streamUrl: string
  videoUrl?: string
}

// 数据生成和管理
class RealTimeDataQueue {
  private queue: RealTimeDataPoint[] = []
  private readonly maxSize: number = 60

  addDataPoint(dataPoint: RealTimeDataPoint): void {
    this.queue.push(dataPoint)
    if (this.queue.length > this.maxSize) {
      this.queue.shift()
    }
  }

  getAllData(): RealTimeDataPoint[] {
    return [...this.queue]
  }

  getSize(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue = []
  }
}

const dataQueueManager = new Map<string, RealTimeDataQueue>()

const getDataQueue = (lineId: string): RealTimeDataQueue => {
  if (!dataQueueManager.has(lineId)) {
    dataQueueManager.set(lineId, new RealTimeDataQueue())
  }
  return dataQueueManager.get(lineId)!
}

const generateRealTimeDataPoint = (lineData: ProductionDataPoint): RealTimeDataPoint => {
  const now = Date.now()
  const timeStr = new Date(now).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  return {
    timestamp: now,
    time: timeStr,
    机身1: Number((lineData.body_temperatures[0] + (Math.random() - 0.5) * 8).toFixed(1)),
    机身2: Number((lineData.body_temperatures[1] + (Math.random() - 0.5) * 8).toFixed(1)),
    机身3: Number((lineData.body_temperatures[2] + (Math.random() - 0.5) * 8).toFixed(1)),
    机身4: Number((lineData.body_temperatures[3] + (Math.random() - 0.5) * 8).toFixed(1)),
    法兰1: Number((lineData.flange_temperatures[0] + (Math.random() - 0.5) * 6).toFixed(1)),
    法兰2: Number((lineData.flange_temperatures[1] + (Math.random() - 0.5) * 6).toFixed(1)),
    模具1: Number((lineData.mold_temperatures[0] + (Math.random() - 0.5) * 10).toFixed(1)),
    模具2: Number((lineData.mold_temperatures[1] + (Math.random() - 0.5) * 10).toFixed(1)),
    螺杆转速: Number(Math.max(0, lineData.screw_motor_speed + (Math.random() - 0.5) * 100).toFixed(0)),
    牵引速度: Number(Math.max(0, lineData.traction_motor_speed + (Math.random() - 0.5) * 4).toFixed(1)),
    主轴电流: Number(Math.max(0, lineData.main_spindle_current + (Math.random() - 0.5) * 6).toFixed(1)),
    实时直径: Number(Math.max(0, lineData.real_time_diameter + (Math.random() - 0.5) * 0.02).toFixed(3)),
    生产长度: Number((lineData.total_length_produced + Math.random() * 2).toFixed(1)),
    氟离子浓度: Number(Math.max(0, lineData.fluoride_ion_concentration + (Math.random() - 0.5) * 0.5).toFixed(2)),
  }
}

const useRealTimeData = (lineData: ProductionDataPoint) => {
  const [chartData, setChartData] = useState<RealTimeDataPoint[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const lineId = lineData.production_line_id

  useEffect(() => {
    if (isInitializedRef.current) return

    const queue = getDataQueue(lineId)
    if (queue.getSize() === 0) {
      const now = Date.now()
      const initialData: RealTimeDataPoint[] = []

      for (let i = 59; i >= 0; i--) {
        const timestamp = now - i * 1000
        const timeStr = new Date(timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })

        const progressRatio = (59 - i) / 59
        const baseLength = lineData.total_length_produced * 0.98
        const currentLength = baseLength + (lineData.total_length_produced - baseLength) * progressRatio

        const dataPoint: RealTimeDataPoint = {
          timestamp,
          time: timeStr,
          机身1: Number((lineData.body_temperatures[0] + (Math.random() - 0.5) * 8).toFixed(1)),
          机身2: Number((lineData.body_temperatures[1] + (Math.random() - 0.5) * 8).toFixed(1)),
          机身3: Number((lineData.body_temperatures[2] + (Math.random() - 0.5) * 8).toFixed(1)),
          机身4: Number((lineData.body_temperatures[3] + (Math.random() - 0.5) * 8).toFixed(1)),
          法兰1: Number((lineData.flange_temperatures[0] + (Math.random() - 0.5) * 6).toFixed(1)),
          法兰2: Number((lineData.flange_temperatures[1] + (Math.random() - 0.5) * 6).toFixed(1)),
          模具1: Number((lineData.mold_temperatures[0] + (Math.random() - 0.5) * 10).toFixed(1)),
          模具2: Number((lineData.mold_temperatures[1] + (Math.random() - 0.5) * 10).toFixed(1)),
          螺杆转速: Number(Math.max(0, lineData.screw_motor_speed + (Math.random() - 0.5) * 100).toFixed(0)),
          牵引速度: Number(Math.max(0, lineData.traction_motor_speed + (Math.random() - 0.5) * 4).toFixed(1)),
          主轴电流: Number(Math.max(0, lineData.main_spindle_current + (Math.random() - 0.5) * 6).toFixed(1)),
          实时直径: Number(Math.max(0, lineData.real_time_diameter + (Math.random() - 0.5) * 0.02).toFixed(3)),
          生产长度: Number(currentLength.toFixed(1)),
          氟离子浓度: Number(Math.max(0, lineData.fluoride_ion_concentration + (Math.random() - 0.5) * 0.5).toFixed(2)),
        }

        initialData.push(dataPoint)
        queue.addDataPoint(dataPoint)
      }

      setChartData(initialData)
      isInitializedRef.current = true
    }
  }, [lineId, lineData])

  useEffect(() => {
    if (!isInitializedRef.current) return

    const updateData = () => {
      const newDataPoint = generateRealTimeDataPoint(lineData)

      setChartData(prevData => {
        if (prevData.length < 60) {
          return [...prevData, newDataPoint]
        }

        const newData = prevData.slice()
        newData.shift()
        newData.push(newDataPoint)
        return newData
      })
    }

    intervalRef.current = setInterval(updateData, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [lineId, lineData, isInitializedRef.current])

  return chartData
}

const generateCameraData = (lineId: string): CameraData[] => {
  // Enhanced mock data based on the provided camera list
  const mockCameras = [
    {
      id: 3,
      name: '冷却水桶',
      status: 'online' as const,
      resolution: '1920x1080',
      fps: 30,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      id: 6,
      name: '收卷位置',
      status: 'warning' as const,
      resolution: '1280x720',
      fps: 20,
      videoUrl: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
      id: 9,
      name: '包装传送',
      status: 'offline' as const,
      resolution: '1920x1080',
      fps: 0,
      videoUrl: ''
    },
    {
      id: 12,
      name: '出料监控',
      status: 'online' as const,
      resolution: '1920x1080',
      fps: 25,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      id: 13,
      name: '辅助设备',
      status: 'online' as const,
      resolution: '1920x1080',
      fps: 30,
      videoUrl: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
      id: 15,
      name: '包装出口',
      status: 'offline' as const,
      resolution: '1920x1080',
      fps: 0,
      videoUrl: ''
    }
  ]

  return mockCameras.map(camera => ({
    id: `${lineId}-CAM-${camera.id.toString().padStart(2, '0')}`,
    name: camera.name,
    location: camera.name, // Using name as location for simplicity
    status: camera.status,
    resolution: camera.resolution,
    fps: camera.fps,
    lastUpdate: new Date().toLocaleTimeString('zh-CN'),
    streamUrl: camera.status === 'offline' ? '' : `rtmp://stream.example.com/live/${lineId}-CAM-${camera.id}`,
    videoUrl: camera.videoUrl
  }))
}

const useCameraSwitcher = (cameras: CameraData[]) => {
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [isAutoSwitching, setIsAutoSwitching] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const onlineCameras = useMemo(() =>
    cameras.filter(camera => camera.status === 'online'),
    [cameras]
  )

  useEffect(() => {
    if (!isAutoSwitching || onlineCameras.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentCameraIndex(prevIndex =>
        (prevIndex + 1) % onlineCameras.length
      )
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoSwitching, onlineCameras.length])

  useEffect(() => {
    if (currentCameraIndex >= onlineCameras.length) {
      setCurrentCameraIndex(0)
    }
  }, [onlineCameras.length, currentCameraIndex])

  const currentCamera = onlineCameras[currentCameraIndex] || null

  return {
    currentCamera,
    currentCameraIndex,
    onlineCameras,
    isAutoSwitching,
    setIsAutoSwitching,
    setCurrentCameraIndex
  }
}

// KPI卡片组件
const KpiCard = ({
  title,
  value,
  icon: Icon,
  unit,
  color,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  unit?: string
  color?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </CardContent>
  </Card>
)

// 生产信息卡片
const ProductionInfoCard = React.memo(({ lineData }: { lineData: ProductionDataPoint }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          生产信息
        </CardTitle>
        <CardDescription>生产线 #{lineData.production_line_id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">产品批号</div>
            <div className="font-mono text-lg font-bold text-blue-600">{lineData.production_batch_number}</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">物料批号</div>
            <div className="font-mono text-lg font-bold text-green-600">{lineData.material_batch_number}</div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">累计产量</div>
            <div className="font-mono text-lg font-bold text-purple-600">
              {lineData.total_length_produced.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">米</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// 温度监控面板
const TemperaturePanel = React.memo(({ realTimeData }: { realTimeData: RealTimeDataPoint[] }) => {
  const chartData = useMemo(() => {
    return realTimeData.map((point, index) => ({
      index,
      机身1: point.机身1,
      机身2: point.机身2,
      机身3: point.机身3,
      机身4: point.机身4,
      法兰1: point.法兰1,
      法兰2: point.法兰2,
      模具1: point.模具1,
      模具2: point.模具2,
    }))
  }, [realTimeData])

  const temperatureLines = useMemo(() => [
    { key: '机身1', color: '#1e40af', name: '机身1' },
    { key: '机身2', color: '#3b82f6', name: '机身2' },
    { key: '机身3', color: '#60a5fa', name: '机身3' },
    { key: '机身4', color: '#93c5fd', name: '机身4' },
    { key: '法兰1', color: '#059669', name: '法兰1' },
    { key: '法兰2', color: '#10b981', name: '法兰2' },
    { key: '模具1', color: '#ea580c', name: '模具1' },
    { key: '模具2', color: '#f97316', name: '模具2' },
  ], [])

  const latest = realTimeData[realTimeData.length - 1]
  if (!latest) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-muted-foreground" />
          温度监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 实时温度数值 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-blue-600">{latest.机身1}°C</div>
            <div className="text-xs text-muted-foreground">机身1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-blue-500">{latest.机身2}°C</div>
            <div className="text-xs text-muted-foreground">机身2</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-blue-400">{latest.机身3}°C</div>
            <div className="text-xs text-muted-foreground">机身3</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-blue-300">{latest.机身4}°C</div>
            <div className="text-xs text-muted-foreground">机身4</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-green-600">{latest.法兰1}°C</div>
            <div className="text-xs text-muted-foreground">法兰1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-green-500">{latest.法兰2}°C</div>
            <div className="text-xs text-muted-foreground">法兰2</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-orange-600">{latest.模具1}°C</div>
            <div className="text-xs text-muted-foreground">模具1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold text-orange-500">{latest.模具2}°C</div>
            <div className="text-xs text-muted-foreground">模具2</div>
          </div>
        </div>

        {/* 温度趋势图 */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="index"
                tick={false}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={35}
                domain={[150, 250]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {temperatureLines.map(line => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
})


// 电机监控面板 - 使用三个独立的ECharts仪表盘
const MotorPanel = React.memo(({ realTimeData }: { realTimeData: RealTimeDataPoint[] }) => {
  const latest = realTimeData[realTimeData.length - 1]
  if (!latest) return null

  return (
    <div className="space-y-6">
      {/* 三个仪表盘并排显示 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-items-center">
        <ScrewSpeedGauge
          value={latest.螺杆转速}
          max={200}
          min={0}
          className="w-64 h-56"
        />
        <TractionSpeedGauge
          value={latest.牵引速度}
          max={50}
          min={0}
          className="w-64 h-56"
        />
        <SpindleCurrentGauge
          value={latest.主轴电流}
          max={100}
          min={0}
          className="w-64 h-56"
        />
      </div>
    </div>
  )
})

// 质量监控面板 - 显示实时直径和生产长度
const QualityPanel = React.memo(({ realTimeData }: { realTimeData: RealTimeDataPoint[] }) => {
  const diameterChartData = useMemo(() => {
    return realTimeData.map((point, index) => ({
      index,
      实时直径: point.实时直径,
    }))
  }, [realTimeData])

  const lengthChartData = useMemo(() => {
    return realTimeData.map((point, index) => ({
      index,
      生产长度: point.生产长度,
    }))
  }, [realTimeData])

  const latest = realTimeData[realTimeData.length - 1]
  if (!latest) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          质量监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 实时数值显示 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded">
            <div className="text-2xl font-bold text-green-600">{latest.实时直径.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">实时直径 mm</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded">
            <div className="text-2xl font-bold text-blue-600">{latest.生产长度.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">生产长度 m</div>
          </div>
        </div>

        {/* 实时直径趋势图 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">实时直径趋势 (最近1分钟)</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={diameterChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="index"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={35}
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'hsl(var(--foreground))',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => [`${Number(value).toFixed(3)} mm`, '实时直径']}
                />
                <Line
                  type="monotone"
                  dataKey="实时直径"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 生产长度趋势图 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">生产长度趋势 (最近1分钟)</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={lengthChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="index"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={35}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'hsl(var(--foreground))',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)} m`, '生产长度']}
                />
                <Line
                  type="monotone"
                  dataKey="生产长度"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// 氟离子浓度监控面板
const FluoridePanel = React.memo(() => {
  // 氟离子浓度数据变量
  const [value, setValue] = useState(4.86)
  const [isAlarm, setIsAlarm] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => {
        const change = (Math.random() - 0.5) * 0.5
        const newValue = Math.max(0, Math.min(10, Number((prev + change).toFixed(2))))
        return newValue
      })
    }, 3000) // 每3秒更新一次

    return () => clearInterval(interval)
  }, [])

  // 根据value的最后一位数字判断是否报警（偶数报警）
  useEffect(() => {
    const lastDigit = Math.floor((value * 100) % 10)
    setIsAlarm(lastDigit % 2 === 0)
  }, [value])

  return (
    <div className="flex items-center gap-3 px-3 h-10 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Droplet className={`h-4 w-4 ${isAlarm ? 'text-amber-500' : 'text-green-500'}`} />
        <span className="text-sm font-medium">氟离子浓度:</span>
      </div>

      <div className="flex items-center gap-1">
        <span className={`${isAlarm ? 'text-amber-500' : 'text-green-500'}`}>
          {value.toFixed(2)} ppm
        </span>
      </div>
    </div>
  )
})

// Enhanced Camera Monitor with video playback and improved UI
const CameraMonitor = React.memo(({ lineId }: { lineId: string }) => {
  const cameras = useMemo(() => generateCameraData(lineId), [lineId])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  // Filter online cameras for auto-play
  const onlineCameras = useMemo(() =>
    cameras.filter(camera => camera.status === 'online'),
    [cameras]
  )

  // Set initial camera
  useEffect(() => {
    if (onlineCameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(onlineCameras[0].id)
    }
  }, [onlineCameras, selectedCameraId])

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isAutoPlay && onlineCameras.length > 0) {
      interval = setInterval(() => {
        const currentIndex = onlineCameras.findIndex(c => c.id === selectedCameraId)
        const nextIndex = (currentIndex + 1) % onlineCameras.length
        setSelectedCameraId(onlineCameras[nextIndex].id)
      }, 5000) // Switch every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlay, onlineCameras, selectedCameraId])

  // Find selected camera
  const selectedCamera = cameras.find(c => c.id === selectedCameraId)

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线'
      case 'warning': return '弱网'
      case 'offline': return '离线'
      default: return '未知'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Camera className="h-5 w-5 text-muted-foreground" />
              摄像头监控
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              在线：{onlineCameras.length} / 共 {cameras.length}
            </span>
          </div>

          {/* Essential controls only */}
          <div className="flex items-center gap-2">
            {/* Camera selector */}
            <Select value={selectedCameraId} onValueChange={(value) => {
              setSelectedCameraId(value)
              setIsAutoPlay(false) // Stop auto-play on manual selection
            }}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    Cam {camera.id.split('-').pop()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Auto-play toggle */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition ${isAutoPlay
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
            >
              {isAutoPlay ? '停止' : '轮播'}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Main video display area */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          {selectedCamera?.status === 'offline' ? (
            <div className="text-gray-500 text-sm">摄像头离线</div>
          ) : selectedCamera?.videoUrl ? (
            <video
              key={selectedCamera.id} // Force re-render when camera changes
              src={selectedCamera.videoUrl}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('Video failed to load:', selectedCamera.videoUrl)
              }}
            />
          ) : (
            <div className="text-center text-white">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">实时视频流</p>
              {selectedCamera && (
                <p className="text-xs opacity-50 mt-1">
                  {selectedCamera.resolution} @ {selectedCamera.fps}fps
                </p>
              )}
            </div>
          )}

          {/* Camera info overlay */}
          {selectedCamera && (
            <>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {selectedCamera.name}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                <div className={`w-2 h-2 rounded-full ${selectedCamera.status === 'online' ? 'bg-green-500' :
                  selectedCamera.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                {getStatusText(selectedCamera.status)}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

const ProductionLineDetail = React.memo(({ lineData }: { lineData: ProductionDataPoint }) => {
  const realTimeData = useRealTimeData(lineData)

  return (
    <div className="space-y-6">
      {/* 电机监控面板 - 三个仪表盘 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Gauge className="h-5 w-5" />
            电机监控
          </CardTitle>
          {/* <CardDescription>实时监控螺杆转速、牵引速度和主轴电流</CardDescription> */}
        </CardHeader>
        <CardContent>
          <MotorPanel realTimeData={realTimeData} />
        </CardContent>
      </Card>

      {/* 温度监控面板 */}
      <TemperaturePanel realTimeData={realTimeData} />



      {/* 质量监控面板 */}
      <QualityPanel realTimeData={realTimeData} />
    </div>
  )
})

export default function Dashboard() {
  const { data: productionData, isLoading, error } = useProductionData()
  const [selectedLineId, setSelectedLineId] = useState<string>('')

  useEffect(() => {
    if (productionData && productionData.length > 0 && !selectedLineId) {
      setSelectedLineId(productionData[0].production_line_id)
    }
  }, [productionData, selectedLineId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-destructive/10 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载数据失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  const selectedLineData = productionData?.find(line => line.production_line_id === selectedLineId)
  const totalLines = productionData?.length || 0
  const isLineActive = selectedLineData ? (parseInt(selectedLineData.production_line_id) % 5 !== 0) : false
  const selectedLineLength = selectedLineData?.total_length_produced || 0
  const hasAlarm = selectedLineData ? (parseInt(selectedLineData.production_line_id) % 10 === 0) : false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">生产线{selectedLineId}实时数据</h1>
          <p className="text-muted-foreground">
            监控当前生产线的关键实时指标。
          </p>
        </div>

        {productionData && productionData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* 氟离子浓度监控 */}
            <FluoridePanel />

            {/* 生产线选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">选择生产线:</span>
              <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择生产线" />
                </SelectTrigger>
                <SelectContent>
                  {productionData.map((line) => (
                    <SelectItem key={line.production_line_id} value={line.production_line_id}>
                      生产线 #{line.production_line_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* 生产信息 KPI */}
      {selectedLineData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">产品批号</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{selectedLineData.production_batch_number}</div>
              {/* <p className="text-xs text-muted-foreground">生产线 #{selectedLineData.production_line_id}</p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">物料批号</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selectedLineData.material_batch_number}</div>
              {/* <p className="text-xs text-muted-foreground">原料信息</p> */}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">累计产量</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{selectedLineData.total_length_produced.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">米</p>
            </CardContent>
          </Card> */}

          <KpiCard
            title="运行状态"
            value={isLineActive ? "运行中" : "已停止"}
            icon={Activity}
            color={isLineActive ? 'text-green-500' : 'text-red-500'}
          />
        </div>
      )}

      {/* Main Content */}
      {selectedLineData ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 生产线数据 - 占3列 */}
          <div className="xl:col-span-3 space-y-6">
            <div>
              <ProductionLineDetail lineData={selectedLineData} />
            </div>
          </div>

          {/* 右侧面板 - 占1列，只显示摄像头监控 */}
          <div className="space-y-6">
            <CameraMonitor lineId={selectedLineData.production_line_id} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">请选择生产线</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            请从上方下拉框中选择要查看的生产线。
          </p>
        </div>
      )}
    </div>
  )
}