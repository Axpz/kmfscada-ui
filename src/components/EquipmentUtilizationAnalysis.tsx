'use client'

import React, { useState, useMemo } from 'react'
import { useProductionData } from '@/hooks/useApi'
import { useQueries } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
import { ChartCard } from '@/components/ui/chart-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { addDays, format } from 'date-fns'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts'
import {
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  Gauge,
} from 'lucide-react'

// 设备状态颜色配置
const STATUS_COLORS = {
  running: '#22c55e',    // 绿色 - 运行中
  idle: '#f59e0b',       // 橙色 - 空闲
  maintenance: '#ef4444', // 红色 - 维护
  offline: '#6b7280',    // 灰色 - 离线
}

// 设备利用率饼图组件
const UtilizationPieChart = ({
  productionLines,
  isLoadingLines,
  selectedLineIds,
  onSelectedLineIdsChange,
}: {
  productionLines: any[]
  isLoadingLines: boolean
  selectedLineIds: string[]
  onSelectedLineIdsChange: (ids: string[]) => void
}) => {
  const [timeRange, setTimeRange] = useState('24h')

  // 计算日期范围
  const dateRange = useMemo(() => {
    const now = new Date()
    let from: Date

    switch (timeRange) {
      case '1h':
        from = addDays(now, 0)
        break
      case '24h':
        from = addDays(now, -1)
        break
      case '7d':
        from = addDays(now, -7)
        break
      case '30d':
        from = addDays(now, -30)
        break
      default:
        from = addDays(now, -1)
    }

    return { from, to: now }
  }, [timeRange])

  const { from, to } = dateRange

  // 生成设备利用率 mock 数据
  const generateUtilizationData = (lineId: string, from: Date, to: Date) => {
    const totalHours = (to.getTime() - from.getTime()) / (1000 * 60 * 60)
    
    // 模拟不同生产线的利用率
    const baseUtilization = 0.75 + (parseInt(lineId) % 3) * 0.05 // 75%-85%基础利用率
    const runningHours = totalHours * (baseUtilization + Math.random() * 0.1 - 0.05)
    const maintenanceHours = totalHours * (0.05 + Math.random() * 0.03)
    const idleHours = totalHours * (0.1 + Math.random() * 0.05)
    const offlineHours = Math.max(0, totalHours - runningHours - maintenanceHours - idleHours)

    return {
      lineId,
      totalHours: Number(totalHours.toFixed(1)),
      runningHours: Number(runningHours.toFixed(1)),
      maintenanceHours: Number(maintenanceHours.toFixed(1)),
      idleHours: Number(idleHours.toFixed(1)),
      offlineHours: Number(offlineHours.toFixed(1)),
      utilizationRate: Number((runningHours / totalHours * 100).toFixed(1)),
    }
  }

  // 使用 useQueries 并行请求多条生产线数据
  const utilizationQueries = useQueries({
    queries: selectedLineIds.map(lineId => ({
      queryKey: ['equipment-utilization', lineId, format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')],
      queryFn: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(generateUtilizationData(lineId, from, to))
          }, 200 + Math.random() * 300)
        })
      },
      enabled: !!(lineId && from && to)
    }))
  })

  const isLoading = utilizationQueries.some(query => query.isLoading)
  const hasError = utilizationQueries.some(query => query.error)
  const allUtilizationData = utilizationQueries.map(query => query.data).filter(Boolean) as any[]

  // 生产线选项
  const productionLineOptions = productionLines?.map(line => ({
    value: line.production_line_id,
    label: `生产线 #${line.production_line_id}`
  })) || []

  // 为每条生产线生成饼图数据
  const pieChartsData = useMemo(() => {
    return allUtilizationData.map(data => {
      const totalHours = data.totalHours
      return {
        lineId: data.lineId,
        utilizationRate: data.utilizationRate,
        pieData: [
          { 
            name: '运行时间', 
            value: data.runningHours, 
            color: STATUS_COLORS.running,
            percentage: ((data.runningHours / totalHours) * 100).toFixed(1)
          },
          { 
            name: '空闲时间', 
            value: data.idleHours, 
            color: STATUS_COLORS.idle,
            percentage: ((data.idleHours / totalHours) * 100).toFixed(1)
          },
          { 
            name: '维护时间', 
            value: data.maintenanceHours, 
            color: STATUS_COLORS.maintenance,
            percentage: ((data.maintenanceHours / totalHours) * 100).toFixed(1)
          },
          { 
            name: '离线时间', 
            value: data.offlineHours, 
            color: STATUS_COLORS.offline,
            percentage: ((data.offlineHours / totalHours) * 100).toFixed(1)
          },
        ].filter(item => item.value > 0)
      }
    })
  }, [allUtilizationData])

  return (
    <ChartCard
      title="设备利用率分析"
      subtitle="设备利用率 = 运行时间/30天；以月为运行单位，如果生产了一个月则设备利用率为100%"
      icon={Activity}
      iconColor="text-green-500"
    >
      <div className="space-y-6">
        {/* 控制面板 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            {/* 生产线多选器 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                生产线
              </Label>
              {isLoadingLines ? (
                <LoadingSpinner />
              ) : (
                <MultiSelect
                  options={productionLineOptions}
                  value={selectedLineIds}
                  onValueChange={onSelectedLineIdsChange}
                  placeholder="选择生产线"
                  className="w-48"
                  maxCount={6}
                  maxDisplay={1}
                />
              )}
            </div>

            {/* 时间范围选择器 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                时间范围30天
              </Label>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                状态图例
              </Label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm whitespace-nowrap">
                      {status === 'running' && '运行'}
                      {status === 'idle' && '空闲'}
                      {status === 'maintenance' && '维护'}
                      {status === 'offline' && '离线'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 饼图区域 */}
        <div className="min-h-[400px]">
          {isLoading && (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasError && (
            <div className="flex flex-col justify-center items-center h-[400px] text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-2">加载数据失败</p>
            </div>
          )}
          {!isLoading && !hasError && selectedLineIds.length === 0 && (
            <div className="flex flex-col justify-center items-center h-[400px] text-muted-foreground">
              <Gauge className="h-12 w-12 mb-4" />
              <p>请选择要分析的生产线</p>
            </div>
          )}
          {!isLoading && !hasError && pieChartsData.length > 0 && (
            <div className={`grid gap-6 ${
              pieChartsData.length === 1 ? 'grid-cols-1' :
              pieChartsData.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
              pieChartsData.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {pieChartsData.map((chartData) => (
                <Card key={chartData.lineId} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      生产线 #{chartData.lineId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-6">
                        {/* 饼图区域 - 更大更居中 */}
                        <div className="flex-shrink-0 w-[200px] h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={chartData.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {chartData.pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number) => [`${value.toFixed(1)}h`, '时长']}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* 数据列表区域 - 紧凑布局 */}
                        <div className="min-w-0 space-y-2">
                          {chartData.pieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 py-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm w-12 text-right">
                                  {item.value.toFixed(1)}h
                                </span>
                                <span className="text-sm font-medium w-10 text-right">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {/* 总利用率显示 */}
                          <div className="pt-2 mt-2 border-t border-border">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium min-w-0">设备利用率</span>
                              <span className="text-sm font-semibold flex-shrink-0">
                                {chartData.utilizationRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  )
}

// 设备利用率数据表格
const UtilizationTable = ({
  productionLines,
  selectedLineIds,
  isLoadingLines,
}: {
  productionLines: any[]
  selectedLineIds: string[]
  isLoadingLines: boolean
}) => {
  const [timeRange, setTimeRange] = useState('24h')

  // 计算日期范围
  const dateRange = useMemo(() => {
    const now = new Date()
    let from: Date

    switch (timeRange) {
      case '1h':
        from = addDays(now, 0)
        break
      case '24h':
        from = addDays(now, -1)
        break
      case '7d':
        from = addDays(now, -7)
        break
      case '30d':
        from = addDays(now, -30)
        break
      default:
        from = addDays(now, -1)
    }

    return { from, to: now }
  }, [timeRange])

  const { from, to } = dateRange

  // 生成设备利用率 mock 数据
  const generateUtilizationData = (lineId: string, from: Date, to: Date) => {
    const totalHours = (to.getTime() - from.getTime()) / (1000 * 60 * 60)
    
    const baseUtilization = 0.75 + (parseInt(lineId) % 3) * 0.05
    const runningHours = totalHours * (baseUtilization + Math.random() * 0.1 - 0.05)
    const maintenanceHours = totalHours * (0.05 + Math.random() * 0.03)
    const idleHours = totalHours * (0.1 + Math.random() * 0.05)
    const offlineHours = Math.max(0, totalHours - runningHours - maintenanceHours - idleHours)

    return {
      lineId,
      totalHours: Number(totalHours.toFixed(1)),
      runningHours: Number(runningHours.toFixed(1)),
      maintenanceHours: Number(maintenanceHours.toFixed(1)),
      idleHours: Number(idleHours.toFixed(1)),
      offlineHours: Number(offlineHours.toFixed(1)),
      utilizationRate: Number((runningHours / totalHours * 100).toFixed(1)),
    }
  }

  // 使用 useQueries 并行请求多条生产线数据
  const utilizationQueries = useQueries({
    queries: selectedLineIds.map(lineId => ({
      queryKey: ['equipment-utilization-table', lineId, format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')],
      queryFn: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(generateUtilizationData(lineId, from, to))
          }, 150 + Math.random() * 200)
        })
      },
      enabled: !!(lineId && from && to)
    }))
  })

  const isLoading = utilizationQueries.some(query => query.isLoading)
  const hasError = utilizationQueries.some(query => query.error)
  const allUtilizationData = utilizationQueries.map(query => query.data).filter(Boolean) as any[]

  if (selectedLineIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            设备利用率详情
          </CardTitle>
          <CardDescription>
            选择生产线以查看详细的设备利用率数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            请先选择要分析的生产线
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              设备利用率详情
            </CardTitle>
            <CardDescription>
              已选择 {selectedLineIds.length} 条生产线的利用率统计
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              时间范围
            </Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1小时</SelectItem>
                <SelectItem value="24h">24小时</SelectItem>
                <SelectItem value="7d">7天</SelectItem>
                <SelectItem value="30d">30天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">加载数据中...</span>
          </div>
        ) : hasError ? (
          <div className="flex flex-col justify-center items-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="mt-2">加载数据失败</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">生产线</TableHead>
                  <TableHead className="text-center">总时长 (h)</TableHead>
                  <TableHead className="text-center">运行时长 (h)</TableHead>
                  <TableHead className="text-center">空闲时长 (h)</TableHead>
                  <TableHead className="text-center">维护时长 (h)</TableHead>
                  <TableHead className="text-center">离线时长 (h)</TableHead>
                  <TableHead className="text-center">利用率 (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUtilizationData.map((data) => (
                  <TableRow key={data.lineId}>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        #{data.lineId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.totalHours}
                    </TableCell>
                    <TableCell className="text-center font-mono text-green-600">
                      {data.runningHours}
                    </TableCell>
                    <TableCell className="text-center font-mono text-orange-600">
                      {data.idleHours}
                    </TableCell>
                    <TableCell className="text-center font-mono text-red-600">
                      {data.maintenanceHours}
                    </TableCell>
                    <TableCell className="text-center font-mono text-gray-600">
                      {data.offlineHours}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={data.utilizationRate >= 80 ? "default" : 
                               data.utilizationRate >= 60 ? "secondary" : "destructive"}
                        className="font-mono"
                      >
                        {data.utilizationRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 主组件
interface EquipmentUtilizationAnalysisProps {
  showTitle?: boolean
}

export default function EquipmentUtilizationAnalysis({ showTitle = false }: EquipmentUtilizationAnalysisProps) {
  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])

  // 设置默认选择的生产线（前3条）
  React.useEffect(() => {
    if (selectedLineIds.length === 0 && productionLines && productionLines.length > 0) {
      const defaultLines = productionLines.slice(0, 3).map(line => line.production_line_id)
      setSelectedLineIds(defaultLines)
    }
  }, [productionLines, selectedLineIds.length])

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            设备利用率分析
          </h1>
          <p className="text-muted-foreground">
            分析设备运行状态，优化生产效率。
          </p>
        </div>
      )}

      <UtilizationPieChart
        productionLines={productionLines || []}
        isLoadingLines={isLoadingLines}
        selectedLineIds={selectedLineIds}
        onSelectedLineIdsChange={setSelectedLineIds}
      />

      {/* <UtilizationTable
        productionLines={productionLines || []}
        selectedLineIds={selectedLineIds}
        isLoadingLines={isLoadingLines}
      /> */}
    </div>
  )
}