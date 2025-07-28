'use client'

import React, { useState, useMemo } from 'react'
import { useProductionData, useHistoricalData } from '@/hooks/useApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChartCard } from '@/components/ui/chart-card'
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

const HistoricalChart = ({
  productionLines,
  isLoadingLines,
}: {
  productionLines: any[]
  isLoadingLines: boolean
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string>('')
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

  // Set default selected line once data is loaded
  React.useEffect(() => {
    if (!selectedLineId && productionLines && productionLines.length > 0) {
      setSelectedLineId(productionLines[0]?.production_line_id || '1')
    }
  }, [productionLines, selectedLineId])

  // Calculate date range based on timeRange
  const dateRange = useMemo(() => {
    const now = new Date()
    let from: Date

    switch (timeRange) {
      case '1h':
        from = addDays(now, 0) // Same day, will be handled by hours
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
  const {
    data: historicalData,
    isLoading,
    error,
  } = useHistoricalData(
    selectedLineId,
    from ? format(from, 'yyyy-MM-dd') : '',
    to ? format(to, 'yyyy-MM-dd') : '',
    !!(selectedLineId && from && to)
  )

  const chartData = useMemo(() => {
    return historicalData?.map(d => ({
      ...d,
      timestamp: format(new Date(d.timestamp), 'MM-dd HH:mm'),
      // Recharts doesn't handle array data keys well, so we average them for plotting
      body_temperatures: d.body_temperatures.reduce((a, b) => a + b, 0) / d.body_temperatures.length,
      flange_temperatures: d.flange_temperatures.reduce((a, b) => a + b, 0) / d.flange_temperatures.length,
      mold_temperatures: d.mold_temperatures.reduce((a, b) => a + b, 0) / d.mold_temperatures.length,
    }))
  }, [historicalData])

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    )
  }

  const currentSeries = DATA_SERIES_CONFIG[chartCategory];

  return (
    <ChartCard
      title="历史数据曲线"
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
              {/* 生产线选择器 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  生产线
                </Label>
                {isLoadingLines ? (
                  <LoadingSpinner />
                ) : (
                  <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionLines?.map(line => (
                        <SelectItem key={line.production_line_id} value={line.production_line_id}>
                          #{line.production_line_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {currentSeries.map(series => (
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
          {error && (
            <div className="flex flex-col justify-center items-center h-full text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-2">加载图表数据失败: {error.message}</p>
            </div>
          )}
          {!isLoading && !error && (
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
                {currentSeries
                  .filter(s => visibleSeries.includes(s.key))
                  .map(s => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      activeDot={{ 
                        r: 4, 
                        stroke: s.color, 
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

// --- Main Component ---

interface DataStatisticsAnalysisProps {
  showTitle?: boolean
}

export default function VisualizationStatisticsAnalysis({ showTitle = false }: DataStatisticsAnalysisProps) {
  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()

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
      />
    </div>
  )
}
