'use client'

import React, { useState, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
import { ChartCard } from '@/components/ui/chart-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { addDays, format } from 'date-fns'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  Gauge,
} from 'lucide-react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { useUtilizationData } from '@/hooks/useSensorData'

// 设备状态颜色配置
const STATUS_COLORS = {
  production: '#22c55e',  // 绿色 - 生产中
  idle: '#f59e0b',        // 橙色 - 空闲中
  offline: '#6b7280',     // 灰色 - 离线中
}

// 设备利用率饼图组件
const UtilizationPieChart = () => {

  const { data: availableLines, isLoading: isLoadingLines } = useAvailableProductionLines()
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])


  React.useEffect(() => {
    if (selectedLineIds.length === 0 && availableLines && availableLines.items.length > 0) {
      const defaultLines = availableLines?.items.map(item => item.name)
      setSelectedLineIds(defaultLines)
    }
  }, [availableLines, selectedLineIds.length])

  const onSelectedLineIdsChange = (ids: string[]) => {
    setSelectedLineIds(ids)
  }

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: addDays(new Date(), -30),
    to: new Date()
  }))

  // 获取日期范围
  const { from, to } = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to }
    }
    // 默认值：最近30天
    return { from: addDays(new Date(), -30), to: new Date() }
  }, [dateRange])

  const { allUtilizationData, isLoading, hasError } = useUtilizationData(
    selectedLineIds, 
    format(from, 'yyyy-MM-dd'), 
    format(to, 'yyyy-MM-dd')
  )

  // 调试信息
  console.log('------------allUtilizationData', allUtilizationData)
  console.log('------------selectedLineIds', selectedLineIds)
  console.log('------------dateRange', { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') })

  // 生产线选项
  const productionLineOptions = availableLines?.items?.map(line => ({
    value: line.name,
    label: line.name
  })) || []

  // 为每条生产线生成饼图数据
  const pieChartsData = useMemo(() => {
    return allUtilizationData
      .filter((data): data is NonNullable<typeof data> => data != null) // 类型守卫
      .map(data => {
        const totalSeconds = data.total_run_time_seconds + data.total_idle_time_seconds + data.total_offline_time_seconds
        
        // 如果总时间为0，返回默认数据
        if (totalSeconds === 0) {
          return {
            lineId: data.line_id,
            utilizationRate: 0,
            pieData: [
              {
                name: '离线中',
                value: 1, // 显示一个小的离线状态
                color: STATUS_COLORS.offline,
                percentage: '100.0'
              }
            ]
          }
        }
        
        return {
          lineId: data.line_id,
          utilizationRate: ((data.total_run_time_seconds / totalSeconds) * 100).toFixed(1),
          pieData: [
            {
              name: '生产中',
              value: data.total_run_time_seconds/3600,
              color: STATUS_COLORS.production,
              percentage: ((data.total_run_time_seconds / totalSeconds) * 100).toFixed(1)
            },
            {
              name: '空闲中',
              value: data.total_idle_time_seconds/3600,
              color: STATUS_COLORS.idle,
              percentage: ((data.total_idle_time_seconds / totalSeconds) * 100).toFixed(1)
            },
            {
              name: '离线中',
              value: data.total_offline_time_seconds/3600,
              color: STATUS_COLORS.offline,
              percentage: ((data.total_offline_time_seconds / totalSeconds) * 100).toFixed(1)
            },
          ]
        }
      })
  }, [allUtilizationData])

  return (
    <ChartCard
      title="设备利用率分析"
      subtitle="设备利用率 = 生产时间/总时间；可选择任意时间范围进行分析"
      icon={Activity}
      iconColor="text-green-500"
    >
      <div className="space-y-6">
        {/* 控制面板 */}
        <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-border/50 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* 生产线选择 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                生产线
              </Label>
              {isLoadingLines ? (
                <div className="flex items-center justify-center h-10 w-48 bg-muted/50 rounded-md">
                  <LoadingSpinner />
                </div>
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

            {/* 时间范围选择 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                时间范围
              </Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-64"
              />
            </div>

            {/* 状态图例 */}
            <div className="flex items-center gap-3 ml-auto">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 px-2 py-1 bg-background/60 rounded-md border border-border/30">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {status === 'production' && '生产中'}
                    {status === 'idle' && '空闲中'}
                    {status === 'offline' && '离线中'}
                  </span>
                </div>
              ))}
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
          {!isLoading && !hasError && pieChartsData.length === 0 && selectedLineIds.length > 0 && (
            <div className="flex flex-col justify-center items-center h-[400px] text-muted-foreground">
              <Gauge className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">暂无数据</p>
              <p className="text-sm text-center max-w-md">
                所选时间范围内没有找到设备利用率数据。<br />
                请尝试选择其他时间范围或检查数据源。
              </p>
            </div>
          )}
          {!isLoading && !hasError && pieChartsData.length > 0 && (
            <div className={`grid gap-6 ${pieChartsData.length === 1 ? 'grid-cols-1' :
                pieChartsData.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                  pieChartsData.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
              {pieChartsData.map((chartData) => (
                <Card key={chartData.lineId} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {chartData.lineId}
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
    const productionHours = totalHours * (baseUtilization + Math.random() * 0.1 - 0.05)
    const idleHours = totalHours * (0.1 + Math.random() * 0.08)
    const offlineHours = Math.max(0, totalHours - productionHours - idleHours)

    return {
      lineId,
      totalHours: Number(totalHours.toFixed(1)),
      productionHours: Number(productionHours.toFixed(1)),
      idleHours: Number(idleHours.toFixed(1)),
      offlineHours: Number(offlineHours.toFixed(1)),
      utilizationRate: Number((productionHours / totalHours * 100).toFixed(1)),
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
                  <TableHead className="text-center">生产时长 (h)</TableHead>
                  <TableHead className="text-center">空闲时长 (h)</TableHead>
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
                      {data.productionHours}
                    </TableCell>
                    <TableCell className="text-center font-mono text-orange-600">
                      {data.idleHours}
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

      <UtilizationPieChart />
    </div>
  )
}