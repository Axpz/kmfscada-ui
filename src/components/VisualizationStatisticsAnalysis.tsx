'use client'

import React, { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { ChartCard } from '@/components/ui/chart-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { addDays, format, subHours } from 'date-fns'
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
  BarChart3,
} from 'lucide-react'
import {
  mean,
  standardDeviation,
  min,
  max,
  median,
  quantile,
  sampleSkewness,
  sampleKurtosis
} from 'simple-statistics'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { useSensorDataHistorical } from '@/hooks/useSensorData'
import type { SensorData } from '@/lib/api-sensor-data'


// --- 正态分布计算函数 (使用 simple-statistics 库) ---

// 生成正态分布曲线数据
const generateNormalDistribution = (
  values: number[],
  points: number = 100,
  rangeMultiplier: number = 3
): Array<{ x: number; y: number; density: number }> => {
  if (values.length === 0) return [] as Array<{ x: number; y: number; density: number }>;

  const meanValue = mean(values);
  const stdDev = standardDeviation(values);

  if (stdDev === 0) {
    return [{ x: meanValue, y: 1, density: 1 }];
  }

  const start = meanValue - rangeMultiplier * stdDev;
  const end = meanValue + rangeMultiplier * stdDev;
  const step = (end - start) / points;

  const distribution = [];
  for (let i = 0; i <= points; i++) {
    const x = start + i * step;
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - meanValue) / stdDev, 2);
    const y = coefficient * Math.exp(exponent);

    distribution.push({ x, y, density: y });
  }

  return distribution;
};


// 正态分布图表组件
const NormalDistributionChart = ({
  data,
  seriesName,
  color
}: {
  data: Array<{ x: number; y: number; density: number }>
  seriesName: string
  color: string
}) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>暂无数据</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="x"
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => Number(value).toFixed(1)}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => Number(value).toFixed(4)}
          label={{ value: '概率密度', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px'
          }}
          formatter={(value: any, name: string) => [
            `${Number(value).toFixed(6)}`,
            '概率密度'
          ]}
          labelFormatter={(label) => `值: ${Number(label).toFixed(2)}`}
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={false}
          name={seriesName}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// 正态分布分析组件
const NormalDistributionAnalysis = ({
  allHistoricalData,
  selectedLineIds,
  visibleSeries,
  chartCategory
}: {
  allHistoricalData: any[]
  selectedLineIds: string[]
  visibleSeries: string[]
  chartCategory: SensorDataType
}) => {
  // 提取选中系列的数据用于正态分布分析
  const distributionData = useMemo(() => {
    if (!allHistoricalData.length || !selectedLineIds.length || !visibleSeries.length) {
      return []
    }

    const results: Array<{
      lineId: string
      seriesKey: string
      seriesName: string
      values: number[]
      mean: number
      stdDev: number
      distribution: Array<{ x: number; y: number; density: number }>
      color: string
    }> = []

    selectedLineIds.forEach((lineId, lineIndex) => {
      const lineData = allHistoricalData[lineIndex]
      if (!lineData?.items) return

      visibleSeries.forEach(seriesKey => {
        const seriesConfig = getSensorDataSeries(chartCategory).find(s => s.key === seriesKey)
        if (!seriesConfig) return

        let values: number[] = []

        // 根据数据系列类型提取值
        lineData.items.forEach((point: any) => {
          const value = point[seriesKey]

          if (typeof value === 'number' && !isNaN(value)) {
            values.push(value)
          }
        })

        if (values.length > 0) {
          const meanValue = mean(values)
          const stdDev = standardDeviation(values)
          const distribution = generateNormalDistribution(values)
          const color = '#8884d8' // 默认颜色

          results.push({
            lineId,
            seriesKey,
            seriesName: `${lineId} - ${seriesConfig.name}`,
            values,
            mean: meanValue,
            stdDev,
            distribution,
            color
          })
        }
      })
    })

    return results
  }, [allHistoricalData, selectedLineIds, visibleSeries, chartCategory])

  if (distributionData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>请选择生产线和数据系列以查看正态分布</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {distributionData.map((item, index) => (
        <Card key={`${item.lineId}-${item.seriesKey}`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{item.seriesName}</span>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>样本数: {item.values.length}</span>
                <span>均值: {item.mean.toFixed(2)}</span>
                <span>标准差: {item.stdDev.toFixed(2)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NormalDistributionChart
              data={item.distribution}
              seriesName={item.seriesName}
              color={item.color}
            />

            {/* 统计信息 - 横排显示，居中对齐 */}
            <div className="mt-4 flex justify-center">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-4xl text-sm">
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">最小值</div>
                  <div className="font-medium">{min(item.values).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">最大值</div>
                  <div className="font-medium">{max(item.values).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">中位数</div>
                  <div className="font-medium">{median(item.values).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">第25百分位</div>
                  <div className="font-medium">{quantile(item.values, 0.25).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">第75百分位</div>
                  <div className="font-medium">{quantile(item.values, 0.75).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">偏度</div>
                  <div className="font-medium">{sampleSkewness(item.values).toFixed(3)}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">峰度</div>
                  <div className="font-medium">{sampleKurtosis(item.values).toFixed(3)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Chart Component ---

// 传感器数据类型
type SensorDataType = 'temperature' | 'current' | 'speed' | 'diameter'

// 传感器数据系列配置
interface SensorDataSeries {
  key: keyof SensorData
  name: string
  color: string
  unit?: string
}

// 传感器数据分组配置
const SENSOR_DATA_GROUPS: Record<SensorDataType, SensorDataSeries[]> = {
  temperature: [
    { key: 'temp_body_zone1', name: '机身温度区1', color: '#8884d8', unit: '°C' },
    { key: 'temp_body_zone2', name: '机身温度区2', color: '#6366f1', unit: '°C' },
    { key: 'temp_body_zone3', name: '机身温度区3', color: '#4f46e5', unit: '°C' },
    { key: 'temp_body_zone4', name: '机身温度区4', color: '#3730a3', unit: '°C' },
    { key: 'temp_flange_zone1', name: '法兰温度区1', color: '#82ca9d', unit: '°C' },
    { key: 'temp_flange_zone2', name: '法兰温度区2', color: '#059669', unit: '°C' },
    { key: 'temp_mold_zone1', name: '模具温度区1', color: '#ffc658', unit: '°C' },
    { key: 'temp_mold_zone2', name: '模具温度区2', color: '#ff8c00', unit: '°C' },
  ],
  current: [
    { key: 'current_body_zone1', name: '机身电流区1', color: '#1e90ff', unit: 'A' },
    { key: 'current_body_zone2', name: '机身电流区2', color: '#4169e1', unit: 'A' },
    { key: 'current_body_zone3', name: '机身电流区3', color: '#0000ff', unit: 'A' },
    { key: 'current_body_zone4', name: '机身电流区4', color: '#0000cd', unit: 'A' },
    { key: 'current_flange_zone1', name: '法兰电流区1', color: '#00bfff', unit: 'A' },
    { key: 'current_flange_zone2', name: '法兰电流区2', color: '#0080ff', unit: 'A' },
    { key: 'current_mold_zone1', name: '模具电流区1', color: '#87ceeb', unit: 'A' },
    { key: 'current_mold_zone2', name: '模具电流区2', color: '#add8e6', unit: 'A' },
    { key: 'motor_current', name: '电机电流', color: '#ff6347', unit: 'A' },
  ],
  speed: [
    { key: 'motor_screw_speed', name: '螺杆转速', color: '#ff7300', unit: 'rpm' },
    { key: 'motor_traction_speed', name: '牵引速度', color: '#a020f0', unit: 'm/min' },
    { key: 'motor_vacuum_speed', name: '真空速度', color: '#ff1493', unit: 'm/min' },
    { key: 'winder_speed', name: '收卷速度', color: '#00bfff', unit: 'rpm' },
    { key: 'winder_tube_speed', name: '收卷管速度', color: '#32cd32', unit: 'rpm' },
  ],
  diameter: [
    { key: 'diameter', name: '实时直径', color: '#e11d48', unit: 'mm' },
  ],
}

// 获取指定类型的传感器系列
const getSensorDataSeries = (type: SensorDataType): SensorDataSeries[] => {
  return SENSOR_DATA_GROUPS[type] || []
}

// 为多选组件准备选项数据
const getSeriesOptions = (category: SensorDataType) => {
  return getSensorDataSeries(category).map(series => ({
    value: series.key,
    label: series.name,
    color: series.color
  }))
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: subHours(new Date(), 1),
    to: new Date()
  }))
  const [visibleSeries, setVisibleSeries] = useState<string[]>([])
  const [chartCategory, setChartCategory] = useState<SensorDataType>('temperature')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNormalDistribution, setShowNormalDistribution] = useState(false)

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

  // 监听图表类型变化，切换时清空数据系列选择
  React.useEffect(() => {
    setVisibleSeries([])
  }, [chartCategory])

  // 获取日期范围
  const from = dateRange?.from ?? addDays(new Date(), -1)
  const to = dateRange?.to ?? new Date()

  // 获取历史数据
  const { queries: historicalQueries, isLoading, hasError, allHistoricalData } = useSensorDataHistorical(
    selectedLineIds,
    from.toISOString(),
    to.toISOString()
  )
  
  // 按生产线分组处理数据
  const chartDataByLine = useMemo(() => {
    if (!allHistoricalData.length) return {}

    const result: Record<string, any[]> = {}

    allHistoricalData.forEach((lineData, lineIndex) => {
      const lineId = selectedLineIds[lineIndex];
      console.log('------------lineId', lineId)
      console.log('------------lineData', lineData)
      
      if (!lineData?.items) return

      result[lineId!] = lineData.items.map((point) => ({
        ...point,
        timestamp: format(new Date(point.timestamp), 'MM-dd HH:mm'),
        timestampValue: new Date(point.timestamp).getTime(),
      })).sort((a, b) => a.timestampValue - b.timestampValue)
    })

    return result
  }, [allHistoricalData, selectedLineIds])

  console.log('-------x-----chartDataByLine', chartDataByLine)

  // 生成图表 - 按生产线分组
  // 例如当用户选择了两条生产线 
  // selectedLineIds = ['LINE_001', 'LINE_002']  // 用户选择了2条生产线
  // chartCategory = 'temperature'                // 用户选择了温度类型
  // visibleSeries = ['temp_body_zone1', 'temp_body_zone2']  // 用户选择了2个温度区域
  // 获取所有温度传感器的配置，即要显示哪些温度数据
  // getSensorDataSeries('temperature')  // 获取所有温度传感器的配置
  // 返回：机身温度区1、机身温度区2、机身温度区3、机身温度区4、法兰温度区1、法兰温度区2、模具温度区1、模具温度区2
  // 这个时候由于用户只选择了['temp_body_zone1', 'temp_body_zone2']，所以
  // .filter(series => visibleSeries.includes(series.key)) 会只保留 机身温度区1、机身温度区2
  const chartSeries = useMemo(() => {
    return selectedLineIds.flatMap((lineId) => {
      return getSensorDataSeries(chartCategory)
        .filter(series => visibleSeries.includes(series.key))
        .map((series) => ({
          key: `${lineId}_${series.key}`,
          name: `生产线${lineId} - ${series.name}`,
          color: series.color,
          dataKey: series.key,
          lineId: lineId,
          seriesKey: series.key,
          unit: series.unit
        }))
    })
  }, [selectedLineIds, chartCategory, visibleSeries])

  // 生产线选项
  const productionLineOptions = productionLines?.map(line => ({
    value: line,
    label: line
  })) || []

  return (
    <ChartCard
      title="生产数据曲线"
      subtitle="分析生产线在选定时间范围内的各项历史指标"
      icon={TrendingUp}
      iconColor="text-blue-500"
    >
      {/* 使用flex布局让图表区域自适应高度 */}
      <div className={`flex flex-col ${isFullscreen ? 'h-full' : 'min-h-[500px]'}`}>
        <div className="flex-shrink-0 mb-6">
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-border/50 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* 生产线选择 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                  生产线
                </Label>
                {isLoadingLines ? (
                  <div className="flex items-center justify-center h-9 w-48 bg-muted/50 rounded-md">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <MultiSelect
                    options={productionLineOptions}
                    value={selectedLineIds}
                    onValueChange={onSelectedLineIdsChange}
                    placeholder="选择"
                    // className="w-48"
                    maxCount={3}
                    maxDisplay={1}
                  />
                )}
              </div>

              {/* 图表类型选择 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                  类型
                </Label>
                <Select value={chartCategory} onValueChange={(v) => setChartCategory(v as SensorDataType)}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">温度传感器</SelectItem>
                    <SelectItem value="current">电流传感器</SelectItem>
                    <SelectItem value="speed">速度传感器</SelectItem>
                    <SelectItem value="diameter">直径传感器</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 数据系列选择 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                  数据系列
                </Label>
                <MultiSelect
                  options={getSeriesOptions(chartCategory)}
                  value={visibleSeries}
                  onValueChange={setVisibleSeries}
                  placeholder="选择数据系列"
                  // className="w-64"
                  maxDisplay={1}
                />
              </div>

              {/* 时间范围选择 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                  {/* 时间 */}
                </Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-64"
                />
              </div>

              {/* 正态分布按钮 */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={showNormalDistribution ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowNormalDistribution(!showNormalDistribution)}
                  disabled={!allHistoricalData.length || !visibleSeries.length}
                  className="h-9"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {showNormalDistribution ? '隐藏分布' : '正态分布'}
                </Button>
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
            <div className="space-y-4">
              {selectedLineIds.map((lineId) => {
                const lineData = chartDataByLine[lineId] || []
                const lineSeries = chartSeries.filter(series => series.lineId === lineId)
                
                return (
                  <div key={lineId} className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">生产线 {lineId}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart
                        data={lineData}
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
                        {lineSeries.map(s => (
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 正态分布分析区域 */}
      {showNormalDistribution && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              数据正态分布分析
            </h3>
            <p className="text-sm text-muted-foreground">
              分析选中数据系列的正态分布特征，包括均值、标准差和概率密度曲线
            </p>
          </div>
          <NormalDistributionAnalysis
            allHistoricalData={allHistoricalData}
            selectedLineIds={selectedLineIds}
            visibleSeries={visibleSeries}
            chartCategory={chartCategory}
          />
        </div>
      )}
    </ChartCard>
  )
}



// --- Main Component ---

interface DataStatisticsAnalysisProps {
  showTitle?: boolean
}

export default function VisualizationStatisticsAnalysis({ showTitle = false }: DataStatisticsAnalysisProps) {
  const { data: availableLines, isLoading } = useAvailableProductionLines()
  const [availableLineIds, setAvailableLineIds] = useState<string[]>([])
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])


  console.log('------------availableLines', availableLines)

  // 设置默认选择的生产线（前1条）
  React.useEffect(() => {
    if (selectedLineIds.length === 0 && availableLines && availableLines.items.length > 0) {
      const lineIds = availableLines.items.map(line => line.name) ?? []
      setAvailableLineIds(lineIds)
    }
  }, [availableLines, selectedLineIds.length])

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
        productionLines={availableLineIds || []}
        isLoadingLines={isLoading}
        selectedLineIds={selectedLineIds}
        onSelectedLineIdsChange={setSelectedLineIds}
      />
    </div>
  )
}
