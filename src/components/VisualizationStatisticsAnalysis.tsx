'use client'

import React, { useState, useMemo } from 'react'
import { useProductionData } from '@/hooks/useApi'
import { useQueries } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChartCard } from '@/components/ui/chart-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { addDays, format } from 'date-fns'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Loader2,
  AlertCircle,
  LineChart,
  TrendingUp,
} from 'lucide-react'

// --- Chart Component ---

const DATA_SERIES_CONFIG = {
  temperature: [
    { key: 'body_temperatures', name: '机身温度', color: '#8884d8' },
    { key: 'flange_temperatures', name: '法兰温度', color: '#82ca9d' },
    { key: 'mold_temperatures', name: '模具温度', color: '#ffc658' },
  ],
  speed: [
    { key: 'screw_motor_speed', name: '螺杆转速', color: '#ff7300' },
    { key: 'traction_motor_speed', name: '牵引速度', color: '#a020f0' },
  ],
  motor: [
    { key: 'main_spindle_current', name: '主轴电流', color: '#1e90ff' },
  ],
}

type ChartCategory = keyof typeof DATA_SERIES_CONFIG;

// 颜色生成函数 - 确保不同生产线有不同颜色
const generateLineColor = (lineId: string, seriesKey: string, selectedLineIds: string[]) => {
  // 为每个数据系列定义基础颜色
  const seriesColors = {
    'body_temperatures': ['#8884d8', '#4f46e5', '#3730a3', '#1e1b4b'],
    'flange_temperatures': ['#82ca9d', '#059669', '#047857', '#064e3b'],
    'mold_temperatures': ['#ffc658', '#f59e0b', '#d97706', '#92400e'],
    'screw_motor_speed': ['#ff7300', '#ea580c', '#c2410c', '#9a3412'],
    'traction_motor_speed': ['#a020f0', '#9333ea', '#7c3aed', '#5b21b6'],
    'main_spindle_current': ['#1e90ff', '#3b82f6', '#2563eb', '#1d4ed8']
  }

  // 获取生产线在选中列表中的索引
  const lineIndex = selectedLineIds.indexOf(lineId)

  // 获取该数据系列的颜色数组
  const colors = seriesColors[seriesKey as keyof typeof seriesColors] || ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']

  // 根据生产线索引选择颜色
  return colors[lineIndex % colors.length]
}

const HistoricalChart = ({
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
  const [visibleSeries, setVisibleSeries] = useState<string[]>(['body_temperatures', 'screw_motor_speed'])
  const [chartCategory, setChartCategory] = useState<ChartCategory>('temperature')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 监听全屏状态变化
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

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

  // 生成 mock 数据的函数
  const generateMockData = (lineId: string, from: Date, to: Date) => {
    const data = []
    const startTime = from.getTime()
    const endTime = to.getTime()
    const interval = (endTime - startTime) / 50 // 生成50个数据点

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(startTime + i * interval)
      const baseTemp = 180 + parseInt(lineId) * 5 // 不同生产线基础温度不同
      const baseSpeed = 1200 + parseInt(lineId) * 100 // 不同生产线基础速度不同

      data.push({
        timestamp: timestamp.toISOString(),
        body_temperatures: [
          baseTemp + Math.random() * 20 - 10,
          baseTemp + Math.random() * 20 - 10,
          baseTemp + Math.random() * 20 - 10
        ],
        flange_temperatures: [
          baseTemp - 20 + Math.random() * 15 - 7.5,
          baseTemp - 20 + Math.random() * 15 - 7.5
        ],
        mold_temperatures: [
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5
        ],
        screw_motor_speed: baseSpeed + Math.random() * 200 - 100,
        traction_motor_speed: 15 + parseInt(lineId) + Math.random() * 5 - 2.5,
        main_spindle_current: 25 + parseInt(lineId) * 2 + Math.random() * 10 - 5
      })
    }
    return data
  }

  // 使用 useQueries 并行请求多条生产线数据（使用 mock 数据）
  const historicalQueries = useQueries({
    queries: selectedLineIds.map(lineId => ({
      queryKey: ['historical-data', lineId, format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')],
      queryFn: () => {
        // 模拟异步请求
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(generateMockData(lineId, from, to))
          }, 300 + Math.random() * 500) // 随机延迟300-800ms
        })
      },
      enabled: !!(lineId && from && to)
    }))
  })

  const isLoading = historicalQueries.some(query => query.isLoading)
  const hasError = historicalQueries.some(query => query.error)
  const allHistoricalData = historicalQueries.map(query => query.data).filter(Boolean)

  // 合并多条生产线的图表数据
  const chartData = useMemo(() => {
    if (!allHistoricalData.length) return []

    // 创建时间戳映射
    const timeMap = new Map()

    allHistoricalData.forEach((lineData, lineIndex) => {
      const lineId = selectedLineIds[lineIndex];

      (lineData as any[])?.forEach((point: any) => {
        const timestamp = format(new Date(point.timestamp), 'MM-dd HH:mm')

        if (!timeMap.has(timestamp)) {
          timeMap.set(timestamp, { timestamp })
        }

        const entry = timeMap.get(timestamp)

        // 为每条生产线添加数据
        entry[`line_${lineId}_body_temperatures`] = point.body_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.body_temperatures?.length || 1)
        entry[`line_${lineId}_flange_temperatures`] = point.flange_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.flange_temperatures?.length || 1)
        entry[`line_${lineId}_mold_temperatures`] = point.mold_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.mold_temperatures?.length || 1)
        entry[`line_${lineId}_screw_motor_speed`] = point.screw_motor_speed
        entry[`line_${lineId}_traction_motor_speed`] = point.traction_motor_speed
        entry[`line_${lineId}_main_spindle_current`] = point.main_spindle_current
      })
    })

    return Array.from(timeMap.values()).sort((a, b) =>
      new Date(`2024-${a.timestamp}`).getTime() - new Date(`2024-${b.timestamp}`).getTime()
    )
  }, [allHistoricalData, selectedLineIds])

  // 生成图表系列 - 按数据类型分组，每个类型包含所有生产线
  const chartSeries = useMemo(() => {
    return selectedLineIds.flatMap((lineId) => {
      return DATA_SERIES_CONFIG[chartCategory]
        .filter(series => visibleSeries.includes(series.key))
        .map((series) => ({
          key: `line_${lineId}_${series.key}`,
          name: `生产线${lineId} - ${series.name}`,
          color: generateLineColor(lineId, series.key, selectedLineIds),
          dataKey: `line_${lineId}_${series.key}`,
          seriesKey: series.key // 添加原始系列键用于分组
        }))
    })
  }, [selectedLineIds, chartCategory, visibleSeries])

  // 修改数据系列切换逻辑 - 全局控制所有生产线的相同数据类型
  const toggleSeries = (seriesKey: string) => {
    setVisibleSeries(prev =>
      prev.includes(seriesKey) ? prev.filter(s => s !== seriesKey) : [...prev, seriesKey]
    )
  }

  // 获取当前类别的数据系列配置
  const currentSeriesConfig = DATA_SERIES_CONFIG[chartCategory]

  // 生产线选项
  const productionLineOptions = productionLines?.map(line => ({
    value: line.production_line_id,
    label: `生产线 #${line.production_line_id}`
  })) || []

  return (
    <ChartCard
      title="生产数据曲线"
      subtitle="分析生产线在选定时间范围内的各项历史指标"
      icon={TrendingUp}
      iconColor="text-blue-500"
    >
      {/* 使用flex布局让图表区域自适应高度 */}
      <div className={`flex flex-col ${isFullscreen ? 'h-full' : 'h-[500px]'}`}>
        {/* 统一控制面板 - Next.js & shadcn/ui 最佳实践 */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            {/* 左侧：选择器组 */}
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
                    maxCount={5}
                    maxDisplay={1}
                  />
                )}
              </div>

              {/* 时间范围选择器 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  时间
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

              {/* 图表类型选择器 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  类型
                </Label>
                <Select value={chartCategory} onValueChange={(v) => setChartCategory(v as ChartCategory)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">温度</SelectItem>
                    <SelectItem value="speed">速度</SelectItem>
                    <SelectItem value="motor">电机</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 右侧：数据系列选择 */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  数据系列
                </Label>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {currentSeriesConfig.map(series => (
                    <div key={series.key} className="flex items-center gap-1.5">
                      <Checkbox
                        id={series.key}
                        checked={visibleSeries.includes(series.key)}
                        onCheckedChange={() => toggleSeries(series.key)}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={series.key}
                        className="flex items-center gap-1.5 text-sm cursor-pointer"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: series.color }}
                        />
                        <span className="whitespace-nowrap">{series.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 - 自适应剩余高度 */}
        <div className="flex-1 min-h-0 w-full">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasError && (
            <div className="flex flex-col justify-center items-center h-full text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-2">加载图表数据失败</p>
            </div>
          )}
          {!isLoading && !hasError && (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={chartData || []}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 10 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={50}
                  orientation="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => Number(value).toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '8px'
                  }}
                />
                {chartSeries.map(s => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    activeDot={{
                      r: 4,
                      stroke: s.color || '#8884d8',
                      strokeWidth: 2,
                      fill: 'hsl(var(--background))'
                    }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </ChartCard>
  )
}

// 数据表格组件
const DataTable = ({
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

  // 生成 mock 数据的函数（与图表组件相同）
  const generateMockData = (lineId: string, from: Date, to: Date) => {
    const data = []
    const startTime = from.getTime()
    const endTime = to.getTime()
    const interval = (endTime - startTime) / 50 // 生成50个数据点

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(startTime + i * interval)
      const baseTemp = 180 + parseInt(lineId) * 5 // 不同生产线基础温度不同
      const baseSpeed = 1200 + parseInt(lineId) * 100 // 不同生产线基础速度不同

      data.push({
        timestamp: timestamp.toISOString(),
        body_temperatures: [
          baseTemp + Math.random() * 20 - 10,
          baseTemp + Math.random() * 20 - 10,
          baseTemp + Math.random() * 20 - 10
        ],
        flange_temperatures: [
          baseTemp - 20 + Math.random() * 15 - 7.5,
          baseTemp - 20 + Math.random() * 15 - 7.5
        ],
        mold_temperatures: [
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5,
          baseTemp + 30 + Math.random() * 25 - 12.5
        ],
        screw_motor_speed: baseSpeed + Math.random() * 200 - 100,
        traction_motor_speed: 15 + parseInt(lineId) + Math.random() * 5 - 2.5,
        main_spindle_current: 25 + parseInt(lineId) * 2 + Math.random() * 10 - 5
      })
    }
    return data
  }

  // 使用 useQueries 并行请求多条生产线数据（使用 mock 数据）
  const historicalQueries = useQueries({
    queries: selectedLineIds.map(lineId => ({
      queryKey: ['historical-data-table', lineId, format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')],
      queryFn: () => {
        // 模拟异步请求
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(generateMockData(lineId, from, to))
          }, 200 + Math.random() * 300) // 随机延迟200-500ms
        })
      },
      enabled: !!(lineId && from && to)
    }))
  })

  const isLoading = historicalQueries.some(query => query.isLoading)
  const hasError = historicalQueries.some(query => query.error)
  const allHistoricalData = historicalQueries.map(query => query.data).filter(Boolean)

  // 计算统计数据
  const statisticsData = useMemo(() => {
    return selectedLineIds.map((lineId, index) => {
      const lineData = allHistoricalData[index]
      if (!lineData || !Array.isArray(lineData) || lineData.length === 0) {
        return {
          lineId,
          avgBodyTemp: 0,
          avgFlangeTemp: 0,
          avgMoldTemp: 0,
          avgScrewSpeed: 0,
          avgTractionSpeed: 0,
          avgSpindleCurrent: 0,
          dataPoints: 0
        }
      }

      const dataPoints = lineData.length

      // 计算平均值
      const avgBodyTemp = lineData.reduce((sum: number, point: any) => {
        const temp = point.body_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.body_temperatures?.length || 1)
        return sum + (temp || 0)
      }, 0) / dataPoints

      const avgFlangeTemp = lineData.reduce((sum: number, point: any) => {
        const temp = point.flange_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.flange_temperatures?.length || 1)
        return sum + (temp || 0)
      }, 0) / dataPoints

      const avgMoldTemp = lineData.reduce((sum: number, point: any) => {
        const temp = point.mold_temperatures?.reduce((a: number, b: number) => a + b, 0) / (point.mold_temperatures?.length || 1)
        return sum + (temp || 0)
      }, 0) / dataPoints

      const avgScrewSpeed = lineData.reduce((sum: number, point: any) => sum + (point.screw_motor_speed || 0), 0) / dataPoints
      const avgTractionSpeed = lineData.reduce((sum: number, point: any) => sum + (point.traction_motor_speed || 0), 0) / dataPoints
      const avgSpindleCurrent = lineData.reduce((sum: number, point: any) => sum + (point.main_spindle_current || 0), 0) / dataPoints

      return {
        lineId,
        avgBodyTemp: Number(avgBodyTemp.toFixed(1)),
        avgFlangeTemp: Number(avgFlangeTemp.toFixed(1)),
        avgMoldTemp: Number(avgMoldTemp.toFixed(1)),
        avgScrewSpeed: Number(avgScrewSpeed.toFixed(1)),
        avgTractionSpeed: Number(avgTractionSpeed.toFixed(1)),
        avgSpindleCurrent: Number(avgSpindleCurrent.toFixed(2)),
        dataPoints
      }
    })
  }, [selectedLineIds, allHistoricalData])

  if (selectedLineIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            生产线数据对比
          </CardTitle>
          <CardDescription>
            选择生产线以查看详细的数据统计对比
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            请先选择要对比的生产线
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
              <TrendingUp className="h-5 w-5" />
              生产线数据对比
            </CardTitle>
            <CardDescription>
              已选择 {selectedLineIds.length} 条生产线的统计数据对比
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
                  <TableHead className="text-center">数据点数</TableHead>
                  <TableHead className="text-center">平均机身温度 (°C)</TableHead>
                  <TableHead className="text-center">平均法兰温度 (°C)</TableHead>
                  <TableHead className="text-center">平均模具温度 (°C)</TableHead>
                  <TableHead className="text-center">平均螺杆转速 (rpm)</TableHead>
                  <TableHead className="text-center">平均牵引速度 (m/min)</TableHead>
                  <TableHead className="text-center">平均主轴电流 (A)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statisticsData.map((data) => (
                  <TableRow key={data.lineId}>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        #{data.lineId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.dataPoints}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgBodyTemp}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgFlangeTemp}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgMoldTemp}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgScrewSpeed}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgTractionSpeed}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {data.avgSpindleCurrent}
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

// --- Main Component ---

interface DataStatisticsAnalysisProps {
  showTitle?: boolean
}

export default function VisualizationStatisticsAnalysis({ showTitle = false }: DataStatisticsAnalysisProps) {
  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])

  // 设置默认选择的生产线（前2条）
  React.useEffect(() => {
    if (selectedLineIds.length === 0 && productionLines && productionLines.length > 0) {
      const defaultLines = productionLines.slice(0, 2).map(line => line.production_line_id)
      setSelectedLineIds(defaultLines)
    }
  }, [productionLines, selectedLineIds.length])

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LineChart className="h-8 w-8" />
            数据统计分析
          </h1>
          <p className="text-muted-foreground">
            分析历史数据，洞察生产趋势。
          </p>
        </div>
      )}

      <HistoricalChart
        productionLines={productionLines || []}
        isLoadingLines={isLoadingLines}
        selectedLineIds={selectedLineIds}
        onSelectedLineIdsChange={setSelectedLineIds}
      />

      {/* <DataTable
        productionLines={productionLines || []}
        selectedLineIds={selectedLineIds}
        isLoadingLines={isLoadingLines}
      /> */}
    </div>
  )
}
