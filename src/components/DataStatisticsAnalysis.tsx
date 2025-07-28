'use client'

import React, { useState, useMemo } from 'react'
import { useProductionData, useHistoricalData } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { DateRangePicker } from '@/components/ui/date-range-picker'
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
  lineId,
  dateRange,
}: {
  lineId: string
  dateRange?: DateRange
}) => {
  const [visibleSeries, setVisibleSeries] = useState<string[]>(['body_temperatures', 'screw_motor_speed'])
  const [chartCategory, setChartCategory] = useState<ChartCategory>('temperature')

  const { from, to } = dateRange || {}
  const {
    data: historicalData,
    isLoading,
    error,
  } = useHistoricalData(
    lineId,
    from ? format(from, 'yyyy-MM-dd') : '',
    to ? format(to, 'yyyy-MM-dd') : '',
    !!(lineId && from && to)
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>历史数据曲线</CardTitle>
          <Select value={chartCategory} onValueChange={(v) => setChartCategory(v as ChartCategory)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择图表类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">温度分析</SelectItem>
              <SelectItem value="speed">速度分析</SelectItem>
              <SelectItem value="motor">电机分析</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          分析生产线在选定时间范围内的各项历史指标。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md">
          {currentSeries.map(series => (
            <div key={series.key} className="flex items-center space-x-2">
              <Checkbox
                id={series.key}
                checked={visibleSeries.includes(series.key)}
                onCheckedChange={() => toggleSeries(series.key)}
              />
              <Label htmlFor={series.key} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: series.color }} />
                {series.name}
              </Label>
            </div>
          ))}
        </div>
        <div className="h-[400px] w-full">
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
            <ResponsiveContainer>
              <RechartsLineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
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
                    />
                  ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---

interface DataStatisticsAnalysisProps {
  showTitle?: boolean
}

export default function DataStatisticsAnalysis({ showTitle = false }: DataStatisticsAnalysisProps) {
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -1),
    to: new Date(),
  })

  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()

  // Set default selected line once data is loaded
  React.useEffect(() => {
    if (!selectedLineId && productionLines && productionLines.length > 0) {
      setSelectedLineId(productionLines[0]?.production_line_id || '1')
    }
  }, [productionLines, selectedLineId])

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

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <Label>生产线</Label>
            {isLoadingLines ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择生产线" />
                </SelectTrigger>
                <SelectContent>
                  {productionLines?.map(line => (
                    <SelectItem key={line.production_line_id} value={line.production_line_id}>
                      生产线 #{line.production_line_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>时间范围</Label>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      {selectedLineId ? (
        dateRange ? (
          <HistoricalChart lineId={selectedLineId} dateRange={dateRange} />
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">请选择日期范围</h3>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">请先选择一条生产线</h3>
        </div>
      )}
    </div>
  )
}
