import React from 'react'
import { format, addDays } from 'date-fns'
import { useSensorDataHistorical } from '@/hooks/useSensorData'

/**
 * 在 VisualizationStatisticsAnalysis 组件中的使用示例
 * 展示如何替换现有的 useQueries 逻辑
 */
export const VisualizationExample: React.FC = () => {
  // 模拟组件中的状态
  const selectedLineIds = ['LINE_001', 'LINE_002']
  const dateRange = {
    from: addDays(new Date(), -7),
    to: new Date()
  }

  // 获取日期范围
  const from = dateRange?.from ?? addDays(new Date(), -7)
  const to = dateRange?.to ?? new Date()

  // 使用新的 hook 替换原来的 useQueries 逻辑
  const { queries, isLoading, hasError, allHistoricalData } = useSensorDataHistorical(
    selectedLineIds,
    from.toISOString(),
    to.toISOString()
  )

  // 原来的代码：
  // const historicalQueries = useQueries({
  //   queries: selectedLineIds.map(lineId => ({
  //     queryKey: ['historical-data', lineId, format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')],
  //     queryFn: () => getSensorData({ line_id: lineId, start_time: from.toISOString(), end_time: to.toISOString() }),
  //     enabled: !!(lineId && from && to)
  //   }))
  // })
  // const isLoading = historicalQueries.some(query => query.isLoading)
  // const hasError = historicalQueries.some(query => query.error)
  // const allHistoricalData = historicalQueries.map(query => query.data).filter(Boolean)

  // 现在可以直接使用 hook 返回的状态
  if (isLoading) {
    return <div>加载中...</div>
  }

  if (hasError) {
    return <div>加载出错</div>
  }

  // 处理图表数据
  const chartData = allHistoricalData.flatMap(data => 
    data.items?.map(item => ({
      timestamp: new Date(item.timestamp).getTime(),
      line_id: item.line_id,
      diameter: item.diameter,
      temperature: item.temp_body_zone1,
      // ... 其他字段
    })) || []
  )

  return (
    <div>
      <h2>可视化统计分析</h2>
      <p>数据点数: {chartData.length}</p>
      <p>生产线: {selectedLineIds.join(', ')}</p>
      <p>时间范围: {format(from, 'yyyy-MM-dd')} 至 {format(to, 'yyyy-MM-dd')}</p>
      
      {/* 这里可以放置图表组件 */}
      <div className="mt-4 p-4 border rounded">
        <p>图表数据已准备就绪，共 {chartData.length} 个数据点</p>
      </div>
    </div>
  )
}

/**
 * 更简洁的使用方式
 */
export const SimpleUsageExample: React.FC = () => {
  const selectedLineIds = ['LINE_001', 'LINE_002']
  const from = addDays(new Date(), -7).toISOString()
  const to = new Date().toISOString()

  // 一行代码获取所有需要的数据和状态
  const { isLoading, hasError, allHistoricalData } = useSensorDataHistorical(
    selectedLineIds,
    from,
    to
  )

  if (isLoading) return <div>加载中...</div>
  if (hasError) return <div>出错</div>

  return (
    <div>
      <h3>简化使用示例</h3>
      <p>成功加载 {allHistoricalData.length} 个数据源</p>
    </div>
  )
}
