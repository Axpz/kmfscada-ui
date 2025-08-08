'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { StatusBadge } from './ui/status-badge'
import { useProductionData } from '@/hooks/useApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Eye,
  RefreshCw,
  Package,
  Activity,
  Factory
} from 'lucide-react'

interface VisualizationCenterProps {
  showTitle?: boolean
}

export default function VisualizationCenter({ showTitle = false }: VisualizationCenterProps) {
  const [timeRange, setTimeRange] = useState('24h')
  const [viewMode, setViewMode] = useState('overview')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 获取生产线数据
  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()

  // 每秒刷新数据
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1)
    }, 1000) // 每1000毫秒（1秒）刷新一次

    return () => clearInterval(interval)
  }, [])

  // 生成模拟的生产线任务数据
  const productionTasksData = useMemo(() => {
    if (!productionLines) return []

    return productionLines.map(line => ({
      lineId: line.production_line_id,
      lineName: `生产线${line.production_line_id}`,
      productBatch: `P${String(line.production_line_id).padStart(3, '0')}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      materialBatch: `M${String(line.production_line_id).padStart(3, '0')}-${String(Math.floor(Math.random() * 9999) + 1000)}`,
      taskDuration: `${Math.floor(Math.random() * 800) + 200}米`,
      fluorideConcentration: `${(Math.random() * 5 + 1).toFixed(2)}mg/L`,
      efficiency: `${Math.floor(Math.random() * 20) + 80}%`,
      output: Math.floor(Math.random() * 500) + 200,
      energy: `${(Math.random() * 50 + 100).toFixed(1)}kW`,
      status: Math.random() > 0.2 ? 'running' : Math.random() > 0.5 ? 'idle' : 'maintenance'
    }))
  }, [productionLines, refreshTrigger])

  // 生成模拟的传感器实时数据
  const sensorData = useMemo(() => {
    if (!productionLines) return []

    return productionLines.map(line => ({
      lineId: line.production_line_id,
      lineName: `生产线${line.production_line_id}`,
      // 机身温度A/B/C/D (4个区域)
      bodyTemperatures: [
        Math.floor(Math.random() * 30) + 180, // A区 180-210°C
        Math.floor(Math.random() * 30) + 185, // B区 185-215°C
        Math.floor(Math.random() * 30) + 190, // C区 190-220°C
        Math.floor(Math.random() * 30) + 195  // D区 195-225°C
      ],
      // 法兰温度A/B (2个区域)
      flangeTemperatures: [
        Math.floor(Math.random() * 20) + 160, // A区 160-180°C
        Math.floor(Math.random() * 20) + 165  // B区 165-185°C
      ],
      // 模具温度 (2个区域)
      moldTemperatures: [
        Math.floor(Math.random() * 25) + 170, // 区域1 170-195°C
        Math.floor(Math.random() * 25) + 175  // 区域2 175-200°C
      ],
      // 螺杆转速 (rpm)
      screwSpeed: Math.floor(Math.random() * 50) + 80, // 80-130 rpm
      // 牵引速度 (m/min)
      tractionSpeed: (Math.random() * 5 + 10).toFixed(1), // 10-15 m/min
      // 实时直径 (mm)
      realTimeDiameter: (Math.random() * 2 + 19).toFixed(2), // 19-21 mm
      // 主轴电流 (A)
      mainSpindleCurrent: (Math.random() * 10 + 25).toFixed(1) // 25-35 A
    }))
  }, [productionLines, refreshTrigger])

  if (isLoadingLines) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">加载可视化数据中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Eye className="h-6 w-6" />
              可视化中心
            </h1>
            <p className="text-muted-foreground">实时监控生产线状态与设备运行数据</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">近1小时</SelectItem>
                <SelectItem value="24h">近24小时</SelectItem>
                <SelectItem value="7d">近7天</SelectItem>
                <SelectItem value="30d">近30天</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">总览</SelectItem>
                <SelectItem value="production">生产线</SelectItem>
                <SelectItem value="equipment">设备</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中生产线</CardTitle>
            <Factory className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {productionTasksData.filter(t => t.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              总计 {productionTasksData.length} 条生产线
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">设备正常率</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((equipmentData.filter(e => e.status === 'normal').length / equipmentData.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {equipmentData.filter(e => e.status === 'normal').length}/{equipmentData.length} 设备正常
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均效率</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(productionTasksData.reduce((acc, t) => acc + parseInt(t.efficiency), 0) / productionTasksData.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              生产效率指标
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总能耗</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {productionTasksData.reduce((acc, t) => acc + parseFloat(t.energy), 0).toFixed(1)}kW
            </div>
            <p className="text-xs text-muted-foreground">
              实时功耗统计
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* 生产线状态表格 */}
      {(viewMode === 'overview' || viewMode === 'production') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-5 w-5 text-blue-500" />
              生产线数据和状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>生产线</TableHead>
                    <TableHead>生产批号</TableHead>
                    <TableHead>原料批号</TableHead>
                    <TableHead>生产长度</TableHead>
                    {/* <TableHead>氟离子浓度</TableHead> */}
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionTasksData.map((task) => (
                    <TableRow key={task.lineId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{task.lineName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{task.productBatch}</span>
                      </TableCell>
                      <TableCell>
                        <span>{task.materialBatch}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {task.taskDuration}
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <span className={`${parseFloat(task.fluorideConcentration) > 4 ? 'text-amber-600' : 'text-green-600'}`}>
                          {task.fluorideConcentration}
                        </span>
                      </TableCell> */}
                      <TableCell>
                        <StatusBadge
                          status={task.status === 'running' ? '生产中' : task.status === 'idle' ? '空闲中' : '离线中'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 设备状态表格 */}
      {(viewMode === 'overview' || viewMode === 'equipment') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-5 w-5 text-green-500" />
              传感器实时数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>生产线</TableHead>
                    <TableHead>机身温度A/B/C/D</TableHead>
                    <TableHead>法兰温度A/B</TableHead>
                    <TableHead>模具温度</TableHead>
                    <TableHead>螺杆转速</TableHead>
                    <TableHead>牵引速度</TableHead>
                    <TableHead>实时直径</TableHead>
                    <TableHead>主轴电流</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensorData.map((sensor) => (
                    <TableRow key={sensor.lineId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{sensor.lineName}</div>
                            <div className="text-xs text-muted-foreground">ID: {sensor.lineId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">A:</span>
                            <span className={`ml-1 ${sensor.bodyTemperatures[0] > 200 ? 'text-red-600' : 'text-green-600'}`}>
                              {sensor.bodyTemperatures[0]}°C
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">B:</span>
                            <span className={`ml-1 ${sensor.bodyTemperatures[1] > 200 ? 'text-red-600' : 'text-green-600'}`}>
                              {sensor.bodyTemperatures[1]}°C
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">C:</span>
                            <span className={`ml-1 ${sensor.bodyTemperatures[2] > 210 ? 'text-red-600' : 'text-green-600'}`}>
                              {sensor.bodyTemperatures[2]}°C
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">D:</span>
                            <span className={`ml-1 ${sensor.bodyTemperatures[3] > 215 ? 'text-red-600' : 'text-green-600'}`}>
                              {sensor.bodyTemperatures[3]}°C
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">A:</span>
                            <span className={`ml-1 ${sensor.flangeTemperatures[0] > 175 ? 'text-orange-600' : 'text-green-600'}`}>
                              {sensor.flangeTemperatures[0]}°C
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">B:</span>
                            <span className={`ml-1 ${sensor.flangeTemperatures[1] > 180 ? 'text-orange-600' : 'text-green-600'}`}>
                              {sensor.flangeTemperatures[1]}°C
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">区域1:</span>
                            <span className={`ml-1 ${sensor.moldTemperatures[0] > 190 ? 'text-orange-600' : 'text-green-600'}`}>
                              {sensor.moldTemperatures[0]}°C
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">区域2:</span>
                            <span className={`ml-1 ${sensor.moldTemperatures[1] > 195 ? 'text-orange-600' : 'text-green-600'}`}>
                              {sensor.moldTemperatures[1]}°C
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`${sensor.screwSpeed > 120 ? 'text-orange-600' : 'text-green-600'}`}>
                          {sensor.screwSpeed} rpm
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${parseFloat(sensor.tractionSpeed) > 14 ? 'text-orange-600' : 'text-green-600'}`}>
                          {sensor.tractionSpeed} m/min
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${parseFloat(sensor.realTimeDiameter) > 20.5 || parseFloat(sensor.realTimeDiameter) < 19.5 ? 'text-red-600' : 'text-green-600'}`}>
                          {sensor.realTimeDiameter} mm
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${parseFloat(sensor.mainSpindleCurrent) > 32 ? 'text-orange-600' : 'text-green-600'}`}>
                          {sensor.mainSpindleCurrent} A
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 空状态 */}
      {productionTasksData.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">暂无可视化数据</h3>
          <p className="text-muted-foreground">请确保生产线正在运行并生成数据</p>
        </div>
      )}
    </div>
  )
}