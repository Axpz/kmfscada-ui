'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Activity, 
  Thermometer, 
  Gauge, 
  Ruler, 
  Zap, 
  Droplet,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { RealtimeMonitorData, ProductionLineData } from '../types'

// 实时数据卡片组件
const RealtimeDataCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  status = 'normal',
  threshold
}: {
  title: string
  value: number
  unit: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'stable'
  status?: 'normal' | 'warning' | 'critical'
  threshold?: { min: number; max: number }
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      default: return 'text-green-500 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className={`${getStatusColor()} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{value.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">{unit}</span>
                {getTrendIcon()}
              </div>
              {threshold && (
                <p className="text-xs text-muted-foreground mt-1">
                  范围: {threshold.min} - {threshold.max} {unit}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 温度监控组件
const TemperatureMonitor = ({ data }: { data: ProductionLineData }) => {
  const temperatureData = [
    { name: '机身一区', value: data.bodyTemperatures.zone1, threshold: { min: 210, max: 230 } },
    { name: '机身二区', value: data.bodyTemperatures.zone2, threshold: { min: 210, max: 230 } },
    { name: '机身三区', value: data.bodyTemperatures.zone3, threshold: { min: 210, max: 230 } },
    { name: '机身四区', value: data.bodyTemperatures.zone4, threshold: { min: 210, max: 230 } },
    { name: '法兰一区', value: data.flangeTemperatures.zone1, threshold: { min: 200, max: 220 } },
    { name: '模具一区', value: data.moldTemperatures.zone1, threshold: { min: 190, max: 205 } },
    { name: '模具二区', value: data.moldTemperatures.zone2, threshold: { min: 190, max: 205 } }
  ]

  const getStatus = (value: number, threshold: { min: number; max: number }) => {
    if (value < threshold.min - 10 || value > threshold.max + 10) return 'critical'
    if (value < threshold.min || value > threshold.max) return 'warning'
    return 'normal'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {temperatureData.map((temp, index) => (
        <RealtimeDataCard
          key={index}
          title={temp.name}
          value={temp.value}
          unit="°C"
          icon={Thermometer}
          status={getStatus(temp.value, temp.threshold)}
          threshold={temp.threshold}
        />
      ))}
    </div>
  )
}

// 速度和电流监控组件
const SpeedCurrentMonitor = ({ data }: { data: ProductionLineData }) => {
  const speedCurrentData = [
    { 
      title: '螺杆电机转速', 
      value: data.motorSpeeds.screw, 
      unit: 'RPM', 
      icon: Gauge,
      threshold: { min: 100, max: 150 }
    },
    { 
      title: '牵引机速度', 
      value: data.motorSpeeds.traction, 
      unit: 'm/min', 
      icon: Activity,
      threshold: { min: 14, max: 16 }
    },
    { 
      title: '主轴电流', 
      value: data.electrical.current, 
      unit: 'A', 
      icon: Zap,
      threshold: { min: 10, max: 50 }
    },
    { 
      title: '实时直径', 
      value: data.measurements.diameter, 
      unit: 'mm', 
      icon: Ruler,
      threshold: { min: 24.8, max: 25.2 }
    }
  ]

  const getStatus = (value: number, threshold: { min: number; max: number }) => {
    if (value < threshold.min - (threshold.max - threshold.min) * 0.2 || 
        value > threshold.max + (threshold.max - threshold.min) * 0.2) return 'critical'
    if (value < threshold.min || value > threshold.max) return 'warning'
    return 'normal'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {speedCurrentData.map((item, index) => (
        <RealtimeDataCard
          key={index}
          title={item.title}
          value={item.value}
          unit={item.unit}
          icon={item.icon}
          status={getStatus(item.value, item.threshold)}
          threshold={item.threshold}
        />
      ))}
    </div>
  )
}

// 生产数据监控组件
const ProductionDataMonitor = ({ data }: { data: ProductionLineData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">生产批号</p>
              <p className="text-lg font-bold">BATCH-{data.id}-001</p>
              <p className="text-xs text-muted-foreground mt-1">物料批次: MAT-{data.id}-001</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">当前批次长度</p>
              <p className="text-2xl font-bold">{data.measurements.length.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">米 (m)</p>
            </div>
            <Ruler className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">氟离子浓度</p>
              <p className="text-2xl font-bold">{data.chemistry.fluoride.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">ppm</p>
            </div>
            <Droplet className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 历史趋势图表组件
const TrendChart = ({ data, title }: { data: any[], title: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function RealtimeDataMonitor() {
  const [selectedPipeline, setSelectedPipeline] = useState('PL-001')
  const [realtimeData, setRealtimeData] = useState<ProductionLineData>({
    id: '1',
    name: 'PL-001',
    status: 'running',
    bodyTemperatures: { zone1: 220, zone2: 225, zone3: 218, zone4: 222 },
    flangeTemperatures: { zone1: 210, zone2: 205 },
    moldTemperatures: { zone1: 195, zone2: 198 },
    motorSpeeds: { screw: 120, traction: 15.2 },
    measurements: { diameter: 25.0, length: 1500 },
    chemistry: { fluoride: 0.8 },
    electrical: { current: 25.5 }
  })

  const [historyData, setHistoryData] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const newData = {
          ...prev,
          bodyTemperatures: {
            zone1: prev.bodyTemperatures.zone1 + (Math.random() * 2 - 1),
            zone2: prev.bodyTemperatures.zone2 + (Math.random() * 2 - 1),
            zone3: prev.bodyTemperatures.zone3 + (Math.random() * 2 - 1),
            zone4: prev.bodyTemperatures.zone4 + (Math.random() * 2 - 1)
          },
          flangeTemperatures: {
            zone1: prev.flangeTemperatures.zone1 + (Math.random() * 1 - 0.5),
            zone2: prev.flangeTemperatures.zone2 + (Math.random() * 1 - 0.5)
          },
          moldTemperatures: {
            zone1: prev.moldTemperatures.zone1 + (Math.random() * 1 - 0.5),
            zone2: prev.moldTemperatures.zone2 + (Math.random() * 1 - 0.5)
          },
          motorSpeeds: {
            screw: prev.motorSpeeds.screw + (Math.random() * 5 - 2.5),
            traction: prev.motorSpeeds.traction + (Math.random() * 0.5 - 0.25)
          },
          measurements: {
            diameter: 25.0 + (Math.random() * 0.2 - 0.1),
            length: prev.measurements.length + Math.random() * 10
          },
          chemistry: {
            fluoride: 0.8 + (Math.random() * 0.05 - 0.025)
          },
          electrical: {
            current: prev.electrical.current + (Math.random() * 2 - 1)
          },
          timestamp: new Date().toISOString()
        }

        // 更新历史数据
        setHistoryData(prevHistory => {
          const newPoint = {
            timestamp: new Date().toLocaleTimeString(),
            value: newData.measurements.diameter
          }
          return [...prevHistory.slice(-19), newPoint]
        })

        return newData
      })
      setLastUpdate(new Date())
    }, 1000) // 每秒更新一次

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date())
    // 这里可以添加手动刷新数据的逻辑
  }, [])

  const getStatusBadge = (status: ProductionLineData['status']) => {
    const variants = {
      running: 'default',
      stopped: 'secondary',
      maintenance: 'default',
      alarm: 'destructive'
    } as const

    const labels = {
      running: '运行中',
      stopped: '已停止',
      maintenance: '维护中',
      alarm: '报警'
    }

    const icons = {
      running: CheckCircle,
      stopped: Clock,
      maintenance: Activity,
      alarm: AlertTriangle
    }

    const Icon = icons[status]

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8" />
            实时数据监控
          </h1>
          <p className="text-muted-foreground">生产线实时数据监控与分析</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PL-001">一号线 (PL-001)</SelectItem>
              <SelectItem value="PL-002">二号线 (PL-002)</SelectItem>
              <SelectItem value="PL-003">三号线 (PL-003)</SelectItem>
              <SelectItem value="PL-004">四号线 (PL-004)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-muted-foreground">生产线状态</p>
                {getStatusBadge(realtimeData.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">流水线编号</p>
                <p className="font-medium">{realtimeData.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">最后更新</p>
                <p className="font-medium">{lastUpdate.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">实时更新中</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Data */}
      <div>
        <h2 className="text-xl font-semibold mb-4">生产数据</h2>
        <ProductionDataMonitor data={realtimeData} />
      </div>

      {/* Temperature Monitoring */}
      <div>
        <h2 className="text-xl font-semibold mb-4">温度监控</h2>
        <TemperatureMonitor data={realtimeData} />
      </div>

      {/* Speed and Current Monitoring */}
      <div>
        <h2 className="text-xl font-semibold mb-4">速度与电流监控</h2>
        <SpeedCurrentMonitor data={realtimeData} />
      </div>

      {/* Trend Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-4">实时趋势</h2>
        <TrendChart data={historyData} title="实时直径测量趋势" />
      </div>
    </div>
  )
}