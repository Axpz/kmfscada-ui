import React from 'react'
import { format, subDays } from 'date-fns'
import { useSensorDataHistorical } from '@/hooks/useSensorData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * 传感器数据使用示例
 * 展示如何使用 useSensorDataHistorical hook
 */
export const SensorDataExample: React.FC = () => {
  // 模拟选中的生产线
  const selectedLineIds = ['LINE_001', 'LINE_002', 'LINE_003']
  
  // 模拟日期范围（最近7天）
  const from = subDays(new Date(), 7)
  const to = new Date()
  
  // 使用 hook 获取历史数据
  const { queries, isLoading, hasError, allHistoricalData } = useSensorDataHistorical(
    selectedLineIds,
    from.toISOString(),
    to.toISOString()
  )

  // 处理加载状态
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>正在加载传感器数据...</span>
        </CardContent>
      </Card>
    )
  }

  // 处理错误状态
  if (hasError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <span className="text-red-500">加载传感器数据时出错</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            传感器数据概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedLineIds.length}
              </div>
              <div className="text-sm text-gray-500">生产线数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {queries.filter(q => q.isSuccess).length}
              </div>
              <div className="text-sm text-gray-500">成功查询</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {allHistoricalData.length}
              </div>
              <div className="text-sm text-gray-500">数据源</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 显示每条生产线的数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queries.map((query, index) => {
          const lineId = selectedLineIds[index]
          const data = query.data
          
          return (
            <Card key={lineId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {lineId}
                  <Badge variant={query.isSuccess ? "default" : query.isError ? "destructive" : "secondary"}>
                    {query.isSuccess ? "成功" : query.isError ? "错误" : "加载中"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {query.isSuccess && data ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      数据点数: <span className="font-medium">{data.items?.length || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      总记录: <span className="font-medium">{data.total || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      页面: <span className="font-medium">{data.page || 1}</span>
                    </div>
                    {data.items && data.items.length > 0 && (
                      <div className="text-sm text-gray-600">
                        最新时间: <span className="font-medium">
                          {format(new Date(data.items[0].timestamp), 'MM-dd HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : query.isError ? (
                  <div className="text-sm text-red-500">
                    错误: {query.error?.message || '未知错误'}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">加载中...</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 显示合并后的数据统计 */}
      {allHistoricalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>数据统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">时间范围:</span> {format(from, 'yyyy-MM-dd')} 至 {format(to, 'yyyy-MM-dd')}
              </div>
              <div className="text-sm">
                <span className="font-medium">总数据源:</span> {allHistoricalData.length}
              </div>
              <div className="text-sm">
                <span className="font-medium">总数据点:</span> {allHistoricalData.reduce((sum, data) => sum + (data.items?.length || 0), 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SensorDataExample
