'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
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
} from 'recharts'
import { GaugesDashboard } from '@/components/ui/gauges-dashboard'
import { useWebSocket } from '@/hooks/useWebsocket'
import { getProductionStatus } from '@/lib/utils'
import { SensorValueView } from './ui/sensor-value-view'
import { useVideoStreams } from '@/hooks/useVideo'
import type { EzvizStream } from '@/lib/api-video'

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

// 温度监控面板
const TemperaturePanel = React.memo(({ realTimeData, chartData }: { realTimeData: ProductionLineData, chartData: ChartDataPoint[] }) => {
  if (!realTimeData) return null

  // 调试信息
  console.log('TemperaturePanel - chartData:', chartData)
  console.log('TemperaturePanel - chartData length:', chartData?.length)

  // 定义温度线的配置 - 使用 useMemo 避免重复创建
  const temperatureLines = useMemo(() => [
    { key: 'temp_body_zone1', color: '#3b82f6', name: '机身1' },
    { key: 'temp_body_zone2', color: '#60a5fa', name: '机身2' },
    { key: 'temp_body_zone3', color: '#93c5fd', name: '机身3' },
    { key: 'temp_body_zone4', color: '#bfdbfe', name: '机身4' },
    { key: 'temp_flange_zone1', color: '#06b6d4', name: '法兰1' },
    { key: 'temp_flange_zone2', color: '#22d3ee', name: '法兰2' },
    { key: 'temp_mold_zone1', color: '#7c3aed', name: '模具1' },
    { key: 'temp_mold_zone2', color: '#8b5cf6', name: '模具2' },
  ], []);

  // 自定义 Tooltip 内容组件
  const CustomTooltip = ({ active, payload, label }: any) => {
    console.log('CustomTooltip:', { active, payload, label })
    
    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
        <div className="font-medium text-xs mb-1">
          {new Date(label).toLocaleTimeString('zh-CN')}
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const line = temperatureLines.find(l => l.key === entry.dataKey)
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{line?.name || entry.dataKey}:</span>
                <span className="font-medium">{Number(entry.value).toFixed(1)}°C</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-md">
          <Thermometer className="h-5 w-5 text-muted-foreground" />
          温度 / 电流
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-0 text-sm">
        {/* 实时温度数值 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center text-sm p-2 bg-muted/30 rounded">
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
        <div className="h-40 w-full relative">
          {chartData && chartData.length > 0 ? (
            <>
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
                  {/* 使用自定义 Tooltip */}
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                    position={{ x: 0, y: -30 }}
                    allowEscapeViewBox={{ x: false, y: true }}
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
            </>
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
                    fontSize: '9px',
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
                    fontSize: '9px',
                    color: 'hsl(var(--foreground))',
                    maxWidth: '220px',
                    maxHeight: '80px',
                    zIndex: 9999,
                    padding: '4px',
                    lineHeight: '1.0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  offset={10}
                  formatter={(value: any, name: string) => {
                    const shortName = name.replace('temp_body_zone', 'B').replace('temp_flange_zone', 'F').replace('temp_mold_zone', 'M')
                    return [`${Number(value).toFixed(1)}°C`, shortName]
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
        className="justify-items-center text-sm"
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
        className="justify-items-center text-sm"
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

  // 直径 Tooltip
  const DiameterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
        <div className="font-medium text-xs mb-1">实时直径</div>
        <div className="text-xs">
          <span className="font-medium">{Number(payload[0].value).toFixed(3)} mm</span>
        </div>
      </div>
    )
  }

  // 长度 Tooltip
  const LengthTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
        <div className="font-medium text-xs mb-1">生产长度</div>
        <div className="text-xs">
          <span className="font-medium">{Number(payload[0].value).toFixed(1)} m</span>
        </div>
      </div>
    )
  }

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
          <div className="h-32 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={diameterChartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
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
                  content={<DiameterTooltip />}
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                  allowEscapeViewBox={{ x: false, y: true }}
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
          <div className="h-32 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={lengthChartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
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
                  content={<LengthTooltip />}
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                  allowEscapeViewBox={{ x: false, y: true }}
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
  // 获取HLS视频流数据
  const { data: videoStreamsResponse, isLoading: isLoadingStreams } = useVideoStreams({
    protocol: 2, // HLS协议
    quality: 1   // 高清
  })
  
  const [selectedStreamIndex, setSelectedStreamIndex] = useState<number>(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5000) // 轮播速度

  // 转换视频流数据为摄像头格式
  const cameras = useMemo(() => {
    if (!videoStreamsResponse?.items) return []
    
    return videoStreamsResponse.items.map((stream: EzvizStream, index: number) => ({
      id: stream.id,
      name: `摄像头 ${stream.channelNo}`,
      location: `通道 ${stream.channelNo}`,
      status: 'online' as const,
      resolution: stream.quality === 1 ? '1920x1080' : '1280x720',
      fps: 25,
      lastUpdate: new Date().toLocaleTimeString('zh-CN'),
      streamUrl: stream.url,
      videoUrl: stream.url, // HLS地址
      deviceSerial: stream.deviceSerial,
      channelNo: stream.channelNo
    }))
  }, [videoStreamsResponse])

  // Filter online cameras for auto-play
  const onlineCameras = useMemo(() =>
    cameras.filter(camera => camera.status === 'online'),
    [cameras]
  )

  // 当视频流很多时(>4个)自动启用轮播
  useEffect(() => {
    if (onlineCameras.length > 4 && !isAutoPlay) {
      setIsAutoPlay(true)
      setAutoPlaySpeed(3000) // 视频流多时加快轮播速度
    } else if (onlineCameras.length <= 4 && onlineCameras.length > 0) {
      setAutoPlaySpeed(5000) // 视频流少时正常轮播速度
    }
  }, [onlineCameras.length, isAutoPlay])

  // Set initial camera
  useEffect(() => {
    if (onlineCameras.length > 0) {
      setSelectedStreamIndex(0)
    }
  }, [onlineCameras])

  // Auto-play functionality with dynamic speed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isAutoPlay && onlineCameras.length > 1) {
      interval = setInterval(() => {
        setSelectedStreamIndex(prevIndex => 
          (prevIndex + 1) % onlineCameras.length
        )
      }, autoPlaySpeed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlay, onlineCameras.length, autoPlaySpeed])

  // Find selected camera
  const selectedCamera = onlineCameras[selectedStreamIndex] || null

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
    <Card className="w-full flex flex-col min-h-[280px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Cctv className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              在线：{onlineCameras.length} / 共 {cameras.length}
              {onlineCameras.length > 4 && (
                <span className="ml-2 px-1 bg-blue-500/20 text-blue-400 rounded">
                  智能轮播
                </span>
              )}
            </span>
          </div>

          {/* Essential controls only */}
          <div className="flex items-center gap-2">
            {/* Camera selector */}
            <Select value={selectedStreamIndex.toString()} onValueChange={(value) => {
              setSelectedStreamIndex(parseInt(value))
              setIsAutoPlay(false) // Stop auto-play on manual selection
            }}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {onlineCameras.map((camera, index) => (
                  <SelectItem key={camera.id} value={index.toString()}>
                    Cam {camera.channelNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Auto-play toggle with speed indicator */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition flex items-center gap-1 ${isAutoPlay
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              title={`轮播速度: ${autoPlaySpeed/1000}秒/次`}
            >
              {isAutoPlay ? '停止' : '轮播'}
              {isAutoPlay && onlineCameras.length > 4 && (
                <span className="text-[10px] opacity-75">快</span>
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex p-4">
        {/* Main video display area - 移除aspect-video，使用flex-1填满剩余空间 */}
        <div className="relative bg-black rounded-lg overflow-hidden w-full flex items-center justify-center">
          {isLoadingStreams ? (
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm opacity-75">加载视频流...</p>
            </div>
          ) : !selectedCamera ? (
            <div className="text-center text-white">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">暂无可用摄像头</p>
            </div>
          ) : selectedCamera.videoUrl ? (
            <video
              key={`${selectedCamera.id}-${selectedStreamIndex}`} // Force re-render when camera changes
              src={selectedCamera.videoUrl}
              autoPlay
              muted
              controls
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('HLS视频流加载失败:', selectedCamera.videoUrl)
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
              {/* 轮播进度指示器 */}
              {isAutoPlay && onlineCameras.length > 1 && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                  {selectedStreamIndex + 1} / {onlineCameras.length}
                </div>
              )}
              {/* HLS标识 */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                HLS
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
    <div className="h-full flex flex-col space-y-4">
      {/* 电机监控面板 - 三个仪表盘 */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-md">
            <Gauge className="h-5 w-5" />
            主机监控
          </CardTitle>
        </CardHeader>
        <CardContent className='pb-0'>
          <MotorPanel realTimeData={realTimeData} />
        </CardContent>
      </Card>

      {realTimeData.winder_torque && realTimeData.winder_speed && realTimeData.winder_layer_count && realTimeData.winder_tube_count && <Card className="flex-shrink-0">
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

      {/* 温度监控面板 - 填充剩余空间 */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 min-h-0">
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

  const { data: productionLines } = useAvailableProductionLines()
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
    <div className="flex flex-col md:flex-row gap-4 min-h-[calc(100vh-120px)]">
      {/* Main content area - 3/4 width */}
      <div className="w-full md:w-3/4 flex flex-col space-y-4 overflow-hidden">
        {/* Header - 固定不滚动 */}
        <div className="flex-shrink-0 flex flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">实时数据</h1>
              <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                <SelectTrigger className="w-48 focus:outline-none focus:ring-0">
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

          <div className="flex flex-row items-start sm:items-center gap-4">
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
          <div className="grid gap-1 md:gap-4 grid-cols-4">
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
                  <span className="text-green-600">{productionData?.current_length.value.toFixed(0)} </span>/
                  <span className="text-blue-600"> {productionData?.target_length.value.toFixed(0) } </span>
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

        {/* Main Content - 完全隐藏滚动条 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {productionData ? (
            <div className="flex-1 flex flex-col">
              {/* 生产线数据 - 填充剩余空间 */}
              <div className="flex-1">
                <ProductionLineDetail realTimeData={productionData} chartData={chartDataArray}/>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">请检查设备或重新选择生产线</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar area - 1/4 width */}
      <div className="w-full md:w-1/4 flex flex-col overflow-hidden">
        <div className="grid grid-rows-3 gap-4 h-full overflow-y-auto">
          <CameraMonitor lineId={productionData?.line_id ?? ''} />
          <CameraMonitor lineId={productionData?.line_id ?? ''} />
          <CameraMonitor lineId={productionData?.line_id ?? ''} />
          <CameraMonitor lineId={productionData?.line_id ?? ''} />
        </div>
      </div>
    </div>
  )
}