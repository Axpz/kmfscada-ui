'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useProductionLines } from '@/hooks/useProductionLines'
import { ProductionLineData, ChartDataPoint } from '@/types'
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
  Cog,
  Cctv,
  Settings,
  Package,
  Droplet,
  WifiOff,
  Zap,
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
import { GaugesDashboard } from '@/components/ui/gauges-dashboard'
import { useWebSocket } from '@/hooks/useWebsocket'
import { getProductionStatus } from '@/lib/utils'
import { SensorValueView } from './ui/sensor-value-view'
import { Sen } from 'next/font/google'

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
const ProductionInfoCard = React.memo(({ lineData }: { lineData: ProductionLineData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          生产信息
        </CardTitle>
        <CardDescription>生产线 #{lineData.line_id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">产品批号</div>
            <div className="font-mono text-lg font-bold text-blue-600">{lineData.batch_product_number}</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">当前长度</div>
            <div className="font-mono text-lg font-bold text-green-600">{lineData.current_length.value.toFixed(2)}</div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">目标长度</div>
            <div className="font-mono text-lg font-bold text-purple-600">
              {lineData.target_length.value.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">米</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// 温度监控面板
const TemperaturePanel = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {
  if (!realTimeData) return null

  // 调试信息
  console.log('TemperaturePanel - chartData:', chartData)
  console.log('TemperaturePanel - chartData length:', chartData?.length)

  // 定义温度线的配置 - 使用 useMemo 避免重复创建
  const temperatureLines = useMemo(() => [
    { key: 'temp_body_zone1', color: '#3b82f6' },
    { key: 'temp_body_zone2', color: '#60a5fa' },
    { key: 'temp_body_zone3', color: '#93c5fd' },
    { key: 'temp_body_zone4', color: '#bfdbfe' },
    { key: 'temp_flange_zone1', color: '#06b6d4' },
    { key: 'temp_flange_zone2', color: '#22d3ee' },
    { key: 'temp_mold_zone1', color: '#7c3aed' },
    { key: 'temp_mold_zone2', color: '#8b5cf6' },
  ], []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          <Thermometer className="h-5 w-5 text-muted-foreground" />
          温度 / 电流
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-0">
        {/* 实时温度数值 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_body_zone1} unit=" °C" className='text-blue-500'/></div>
            <div><SensorValueView sensor={realTimeData.current_body_zone1} unit=" A" className='text-blue-500'/></div>
            <div className="text-xs text-muted-foreground">机身1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_body_zone2} unit=" °C" className='text-blue-400'/></div>
            <div><SensorValueView sensor={realTimeData.current_body_zone2} unit=" A" className='text-blue-400'/></div>
            <div className="text-xs text-muted-foreground">机身2</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_body_zone3} unit=" °C" className='text-blue-300'/></div>
            <div><SensorValueView sensor={realTimeData.current_body_zone3} unit=" A" className='text-blue-300'/></div>
            <div className="text-xs text-muted-foreground">机身3</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_body_zone4} unit=" °C" className='text-blue-200'/></div>
            <div><SensorValueView sensor={realTimeData.current_body_zone4} unit=" A" className='text-blue-200'/></div>
            <div className="text-xs text-muted-foreground">机身4</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_flange_zone1} unit=" °C" className='text-cyan-500'/></div>
            <div><SensorValueView sensor={realTimeData.current_flange_zone1} unit=" A" className='text-cyan-500'/></div>
            <div className="text-xs text-muted-foreground">法兰1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_flange_zone2} unit=" °C" className='text-cyan-400'/></div>
            <div><SensorValueView sensor={realTimeData.current_flange_zone2} unit=" A" className='text-cyan-400'/></div>
            <div className="text-xs text-muted-foreground">法兰2</div>
          </div>

          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_mold_zone1} unit=" °C" className='text-violet-600'/></div>
            <div><SensorValueView sensor={realTimeData.current_mold_zone1} unit=" A" className='text-violet-600'/></div>
            <div className="text-xs text-muted-foreground">模具1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div><SensorValueView sensor={realTimeData.temp_mold_zone2} unit=" °C" className='text-violet-500'/></div>
            <div><SensorValueView sensor={realTimeData.current_mold_zone2} unit=" A" className='text-violet-500'/></div>
            <div className="text-xs text-muted-foreground">模具2</div>
          </div>
        </div>

        {/* 温度趋势图 */}
        <div className="h-40 w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                key={`temp-chart-${realTimeData.line_id}`}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="timestamp"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
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
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                {temperatureLines.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无温度数据</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

const CurrentPanel = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {
  if (!realTimeData) return null

  // 定义电流线的配置 - 使用 useMemo 避免重复创建
  const currentLines = useMemo(() => [
    { key: 'current_body_zone1', color: '#3b82f6' },
    { key: 'current_body_zone2', color: '#60a5fa' },
    { key: 'current_body_zone3', color: '#93c5fd' },
    { key: 'current_body_zone4', color: '#bfdbfe' },
    { key: 'current_flange_zone1', color: '#06b6d4' },
    { key: 'current_flange_zone2', color: '#22d3ee' },
    { key: 'current_mold_zone1', color: '#7c3aed' },
    { key: 'current_mold_zone2', color: '#8b5cf6' },
  ], []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          <Zap className="h-5 w-5 text-muted-foreground" />
          电流 监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-0">
        {/* 实时温度数值 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone1} unit="A" className='text-blue-500'/>
            <div className="text-xs text-muted-foreground">机身1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone2} unit="A" className='text-blue-400'/>
            <div className="text-xs text-muted-foreground">机身2</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone3} unit="A" className='text-blue-300'/>
            <div className="text-xs text-muted-foreground">机身3</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone4} unit="A" className='text-blue-200'/>
            <div className="text-xs text-muted-foreground">机身4</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_flange_zone1} unit="A" className='text-cyan-500'/>
            <div className="text-xs text-muted-foreground">法兰1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_flange_zone2} unit="A" className='text-cyan-400'/>
            <div className="text-xs text-muted-foreground">法兰2</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_mold_zone1} unit="A" className='text-violet-600'/>
            <div className="text-xs text-muted-foreground">模具1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_mold_zone2} unit="A" className='text-violet-500'/>
            <div className="text-xs text-muted-foreground">模具2</div>
          </div>
        </div>

        {/* 电流趋势图 */}
        <div className="h-40 w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                key={`current-chart-${realTimeData.line_id}`}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="timestamp"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={35}
                  domain={[0, 20]}
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
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                {currentLines.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无电流数据</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

const WinderPanel = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {
  if (!realTimeData) return null

  // 定义电流线的配置 - 使用 useMemo 避免重复创建
  const currentLines = useMemo(() => [
    { key: 'current_body_zone1', color: '#3b82f6' },
    { key: 'current_body_zone2', color: '#60a5fa' },
    { key: 'current_body_zone3', color: '#93c5fd' },
    { key: 'current_body_zone4', color: '#bfdbfe' },
    { key: 'current_flange_zone1', color: '#06b6d4' },
    { key: 'current_flange_zone2', color: '#22d3ee' },
    { key: 'current_mold_zone1', color: '#7c3aed' },
    { key: 'current_mold_zone2', color: '#8b5cf6' },
  ], []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          <Zap className="h-5 w-5 text-muted-foreground" />
          电流 监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-0">
        {/* 实时温度数值 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone1} unit="A" className='text-blue-500'/>
            <div className="text-xs text-muted-foreground">机身1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone2} unit="A" className='text-blue-400'/>
            <div className="text-xs text-muted-foreground">机身2</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone3} unit="A" className='text-blue-300'/>
            <div className="text-xs text-muted-foreground">机身3</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_body_zone4} unit="A" className='text-blue-200'/>
            <div className="text-xs text-muted-foreground">机身4</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_flange_zone1} unit="A" className='text-cyan-500'/>
            <div className="text-xs text-muted-foreground">法兰1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_flange_zone2} unit="A" className='text-cyan-400'/>
            <div className="text-xs text-muted-foreground">法兰2</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_mold_zone1} unit="A" className='text-violet-600'/>
            <div className="text-xs text-muted-foreground">模具1</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_mold_zone2} unit="A" className='text-violet-500'/>
            <div className="text-xs text-muted-foreground">模具2</div>
          </div>
        </div>

        {/* 电流趋势图 */}
        <div className="h-40 w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                key={`current-chart-${realTimeData.line_id}`}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="timestamp"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={35}
                  domain={[0, 20]}
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
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                {currentLines.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无电流数据</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

// 电机监控面板 - 使用三个独立的ECharts仪表盘
const MotorPanel = React.memo(({ realTimeData }: { realTimeData: ProductionLineData}) => {
  const latest = realTimeData
  if (!latest) return null

  return (
    <div className="space-y-4">
      {/* 四个仪表盘并排显示 */}
      <GaugesDashboard
        motorTorque={latest.motor_screw_torque}
        screwSpeed={latest.motor_screw_speed}
        tractionSpeed={latest.motor_traction_speed}
        spindleCurrent={latest.motor_current}
        vacuumSpeed={latest.motor_vacuum_speed}
        className="justify-items-center"
      />
    </div>
  )
})

// 电机监控面板 - 使用三个独立的ECharts仪表盘
const WinderMotorPanel = React.memo(({ realTimeData }: { realTimeData: ProductionLineData}) => {
  const latest = realTimeData
  if (!latest) return null

  return (
    <div className="space-y-4">
      {/* 四个仪表盘并排显示 */}
      <GaugesDashboard
        winderTorque={latest.winder_torque}
        winderSpeed={latest.winder_speed}
        winderTubeSpeed={latest.winder_tube_speed}
        winderLayerCount={latest.winder_layer_count}
        winderTubeCount={latest.winder_tube_count}
        className="justify-items-center"
      />
    </div>
  )
})

// 质量监控面板 - 显示实时直径和生产长度
const QualityPanel = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {
  const diameterChartData = useMemo(() => {
    return chartData.map((point, index) => ({
      index,
      实时直径: point.diameter,
    }))
  }, [chartData])

  const lengthChartData = useMemo(() => {
    return chartData.map((point, index) => ({
      index,
      生产长度: point.current_length,
    }))
  }, [chartData])

  if (!realTimeData) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          <Settings className="h-5 w-5 text-muted-foreground" />
          质量监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-0">
        {/* 实时数值显示 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.diameter} unit="mm" />
            <div className="text-xs text-muted-foreground">实时直径 mm</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <SensorValueView sensor={realTimeData.current_length} unit="m" />
            <div className="text-xs text-muted-foreground">生产长度 m</div>
          </div>
        </div>

        {/* 实时直径趋势图 */}
        <div className="space-y-2">
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
                  isAnimationActive={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 生产长度趋势图 */}
        <div className="space-y-2">
          {/* <h4 className="text-sm font-medium text-muted-foreground">生产长度趋势 (最近1分钟)</h4> */}
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
                  isAnimationActive={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
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
    if (onlineCameras.length > 0 && !selectedCameraId && onlineCameras[0]?.id) {
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
        const nextCamera = onlineCameras[nextIndex]
        if (nextCamera?.id) {
          setSelectedCameraId(nextCamera.id)
        }
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
              <Cctv className="h-5 w-5 text-muted-foreground" />
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

const ProductionLineDetail = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {

  return (
    <div className="space-y-4">
      {/* 电机监控面板 - 三个仪表盘 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-md">
            <Gauge className="h-5 w-5" />
            电机监控
          </CardTitle>
        </CardHeader>
        <CardContent className='pb-0'>
          <MotorPanel realTimeData={realTimeData} />
        </CardContent>
      </Card>

      {realTimeData.winder_torque && realTimeData.winder_speed && realTimeData.winder_layer_count && realTimeData.winder_tube_count && <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-md">
            <Gauge className="h-5 w-5" />
            收卷机监控
          </CardTitle>
        </CardHeader>
        <CardContent className='pb-0'>
          <WinderMotorPanel realTimeData={realTimeData} />
        </CardContent>
      </Card>}

      {/* 温度监控面板 */}
      <div className="grid grid-cols-2 gap-4">
        <TemperaturePanel realTimeData={realTimeData} chartData={chartData} />
        {/* <CurrentPanel realTimeData={realTimeData} chartData={chartData} /> */}
        <QualityPanel realTimeData={realTimeData} chartData={chartData} />
      </div>
    </div>
  )
})

export default function Dashboard() {
  
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  const [lineIds, setLineIds] = useState<string[]>([])
  const [productionData, setProductionData] = useState<ProductionLineData | null>(null)
  const [chartDataArray, setChartDataArray] = useState<ChartDataPoint[]>([])

  const { 
    isConnected, 
    realtimeData, 
    chartDataArray: wsChartDataArray, 
  } = useWebSocket(selectedLineId, 'production_data')

  const { data: productionLines } = useProductionLines()
  useEffect(() => {
    if (productionLines?.items) {
      const lineIds = productionLines.items.map((line) => line.name)
      setLineIds(lineIds)
      if (!selectedLineId && lineIds.length > 0) {
        setSelectedLineId(lineIds[0] || '')
      } 
    }
  }, [productionLines])

  useEffect(() => {
    setProductionData(null)
    setChartDataArray([])
  }, [selectedLineId])

  useEffect(() => {
    if (realtimeData) {
      setProductionData(realtimeData)
      setChartDataArray(wsChartDataArray)
    }
  }, [realtimeData, wsChartDataArray])

  console.log('=== Dashboard Debug ===')
  console.log('lineIds:', lineIds)
  console.log('selectedLineId:', selectedLineId)
  console.log('chartDataArray:', chartDataArray)
  console.log('productionData:', productionData)
  console.log('isConnected:', isConnected)

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main content area - 3/4 width */}
      <div className="w-3/4 space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">实时数据</h1>
              <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="生产线" />
                </SelectTrigger>
                <SelectContent>
                  {lineIds.map((lineId) => (
                    <SelectItem key={lineId} value={lineId}>
                      生产线 {lineId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 px-4 h-10 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">氟离子浓度</span>
                <Droplet className="size-4" />
              </div>
              <div className="flex items-center gap-1">
                <SensorValueView sensor={productionData?.fluoride_concentration} unit="ppm" />
              </div>
            </div>
          </div>
        </div>

        {/* 生产信息 KPI */}
        {/* {productionData && ( */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 前3列：使用flex让所有项目等宽分布 */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">产品批号</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-md font-bold text-blue-600">{productionData?.batch_product_number}</div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">物料批号</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-md font-bold text-blue-600">{productionData?.batch_product_number}</div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">生产进度</CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              { productionData?.current_length.value && 
                <div className="text-md font-bold text-blue-600">
                  <span className="text-green-600">{productionData?.current_length.value} </span>/
                  <span className="text-blue-600"> {productionData?.target_length.value } </span>
                </div>
              }
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">运行状态</CardTitle>
                <Cog className={`h-4 w-4 ${productionData?.motor_screw_speed.value ?? 0 > 0.1 ? 
                  'text-green-500 animate-[spin_3s_linear_infinite]' : 'text-gray-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-md font-bold ${productionData?.motor_screw_speed.value ?? 0 > 0.1 ? 'text-green-600' : 'text-gray-600'}`}>
                  {getProductionStatus(productionData?.motor_screw_speed)}</div>
              </CardContent>
            </Card>
          </div>
        {/* )} */}

        {/* Main Content */}
        {productionData ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* 生产线数据 - 占3列 */}
            <div className="xl:col-span-4 space-y-4">
              <div>
                <ProductionLineDetail realTimeData={productionData} chartData={chartDataArray}/>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">请检查设备或重新选择生产线</h3>
          </div>
        )}
      </div>

      {/* Right sidebar area - 1/4 width */}
      <div className="w-1/4">
        {productionData &&
          <div className="space-y-4 h-fit">
            <CameraMonitor lineId={productionData.line_id} />
            <CameraMonitor lineId={productionData.line_id} />
            <CameraMonitor lineId={productionData.line_id} />
            <CameraMonitor lineId={productionData.line_id} />
          </div>
        }
      </div>
    </div>
  )
}