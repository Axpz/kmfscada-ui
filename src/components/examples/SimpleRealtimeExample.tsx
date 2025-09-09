/**
 * 简单的实时数据使用示例
 * 展示如何在组件中使用 RealtimeDataService
 */

'use client'

import React, { useState } from 'react'
import { useRealtimeData } from '@/hooks/useRealtimeData-to-delete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Thermometer, 
  Gauge, 
  Activity,
  RefreshCw
} from 'lucide-react'

export default function SimpleRealtimeExample() {
  const [selectedLineId, setSelectedLineId] = useState('1')
  
  // 使用实时数据 Hook
  const { data, latest, loading, error, refresh, hasData } = useRealtimeData(selectedLineId)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>加载数据中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">
            错误: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 生产线选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择生产线</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['1', '2', '3', '4'].map(lineId => (
              <Button
                key={lineId}
                variant={selectedLineId === lineId ? 'default' : 'outline'}
                onClick={() => setSelectedLineId(lineId)}
              >
                生产线 {lineId}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 数据状态 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>数据状态</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={hasData ? 'default' : 'secondary'}>
              {hasData ? `${data.length} 个数据点` : '无数据'}
            </Badge>
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 温度监控 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    温度监控
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>机身1:</span>
                      <span className="font-mono">{latest.机身1}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>机身2:</span>
                      <span className="font-mono">{latest.机身2}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>法兰1:</span>
                      <span className="font-mono">{latest.法兰1}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>模具1:</span>
                      <span className="font-mono">{latest.模具1}°C</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 电机监控 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    电机监控
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>螺杆转速:</span>
                      <span className="font-mono">{latest.螺杆转速} RPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>牵引速度:</span>
                      <span className="font-mono">{latest.牵引速度} m/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>主轴电流:</span>
                      <span className="font-mono">{latest.主轴电流} A</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 质量监控 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    质量监控
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>实时直径:</span>
                      <span className="font-mono">{latest.实时直径} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>生产长度:</span>
                      <span className="font-mono">{latest.生产长度} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>氟离子浓度:</span>
                      <span className="font-mono">{latest.氟离子浓度} ppm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据历史 */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>数据历史 (最近10个数据点)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.slice(-10).reverse().map((point, index) => (
                <div key={point.timestamp} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span className="font-mono">{point.time}</span>
                  <div className="flex gap-4">
                    <span>螺杆: {point.螺杆转速} RPM</span>
                    <span>直径: {point.实时直径} mm</span>
                    <span>机身1: {point.机身1}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}