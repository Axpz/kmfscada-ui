'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { StatusBadge } from './ui/status-badge'
import { getProductionStatus } from '@/lib/utils'
import { SensorValueView } from './ui/sensor-value-view'
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
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { useWebSocket } from '@/hooks/useWebsocket'
import { ProductionLineData } from '@/types'

interface VisualizationCenterProps {
  showTitle?: boolean
}


export default function VisualizationCenter({ showTitle = false }: VisualizationCenterProps) {
  const [viewMode, setViewMode] = useState('overview')

  const [realtimeLoading, setRealtimeLoading] = useState(true)
  const [realtimeError, setRealtimeError] = useState<string | null>(null)

  const { data: activeLineIds } = useAvailableProductionLines()
  const lineIds = activeLineIds?.items?.map(line => line.name) || []

  const { status: wsStatus, realtimeDataMap, isConnected } = useWebSocket('*', 'production_data')

  // 使用 useEffect 监控连接状态变化
  useEffect(() => {
    if (wsStatus === 'connecting') {
      setRealtimeLoading(true)
      setRealtimeError(null)
    } else if (wsStatus === 'connected') {
      setRealtimeLoading(false)
      setRealtimeError(null)
    } else if (wsStatus === 'disconnected') {
      setRealtimeLoading(false)
      setRealtimeError('WebSocket 连接已断开')
    } else if (wsStatus === 'error') {
      setRealtimeLoading(false)
      setRealtimeError('WebSocket 连接错误')
    }
  }, [wsStatus])

  // 计算有效的生产线数据
  // 计算连接状态
  const hasRealtimeData = lineIds.some(lineId => realtimeDataMap.get(lineId)) && isConnected

  // 缓存生产线数据，减少重复计算
  const productionLinesWithData = useMemo(() => {
    return lineIds.map(lineId => ({
      lineId,
      data: realtimeDataMap.get(lineId),
      hasData: !!realtimeDataMap.get(lineId)
    }))
  }, [lineIds, realtimeDataMap])


  if (realtimeLoading && !isConnected) {
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
            
            {/* 连接状态指示器 */}
            <div className="flex items-center gap-2 mt-2">
              {isConnected && hasRealtimeData ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>实时数据连接</span>
                  <span className="text-xs text-muted-foreground">
                    ({lineIds.filter(lineId => realtimeDataMap.get(lineId)).length} 条生产线在线)
                  </span>
                </div>
              ) : realtimeLoading ? (
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>连接中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>等待实时数据</span>
                  {realtimeError && (
                    <span className="text-xs text-red-600 ml-1">
                      ({realtimeError})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 生产线状态表格 */}
      {(viewMode === 'overview' || viewMode === 'production') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-5 w-5 text-blue-500" />
                生产线数据和状态
              </div>
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
                    <TableHead>当前米数</TableHead>
                    <TableHead>长度设定</TableHead>
                    <TableHead>当前直径</TableHead>
                    <TableHead>氟离子浓度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {productionLinesWithData.map(({ lineId, data: line, hasData }) => (
                    <TableRow key={lineId}>
                      <TableCell>
                        <span>{line?.line_id || lineId}</span>
                      </TableCell>
                      <TableCell>
                        <span>{line?.batch_product_number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span>{line?.batch_product_number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.current_length} unit="m" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.target_length} unit="m" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.diameter} unit="mm" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.fluoride_concentration} unit="mg/L" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getProductionStatus(line?.motor_screw_speed)} />
                      </TableCell>
                      <TableCell>
                        <span>{line?.timestamp ? new Date(line.timestamp).toLocaleString() : '-'}</span>
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-5 w-5 text-green-500" />
                传感器实时数据
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>生产线</TableHead>
                    <TableHead>机筒温度</TableHead>
                    <TableHead>机筒电流</TableHead>
                    <TableHead>法兰温度</TableHead>
                    <TableHead>法兰电流</TableHead>
                    <TableHead>模具温度</TableHead>
                    <TableHead>模具电流</TableHead>
                    <TableHead>主机当前电流</TableHead>
                    <TableHead>主机当前扭力</TableHead>
                    <TableHead>主机当前速度</TableHead>
                    <TableHead>牵引当前速度</TableHead>
                    <TableHead>真空当前速度</TableHead>
                    <TableHead>当前收卷速度</TableHead>
                    <TableHead>当前收卷扭力</TableHead>
                    <TableHead>当前排管层数</TableHead>
                    <TableHead>当前排管速度</TableHead>
                    <TableHead>当前排管根</TableHead>
                    <TableHead>最后更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionLinesWithData.map(({ lineId, data: line, hasData }) => (
                    <TableRow key={lineId}>
                      <TableCell>
                        <span>{line?.line_id || lineId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.temp_body_zone1} unit="°C" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.temp_body_zone2} unit="°C" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">3:</span>
                            <SensorValueView sensor={line?.temp_body_zone3} unit="°C" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">4:</span>
                            <SensorValueView sensor={line?.temp_body_zone4} unit="°C" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.current_body_zone1} unit="A" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.current_body_zone2} unit="A" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">3:</span>
                            <SensorValueView sensor={line?.current_body_zone3} unit="A" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">4:</span>
                            <SensorValueView sensor={line?.current_body_zone4} unit="A" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.temp_flange_zone1} unit="°C" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.temp_flange_zone2} unit="°C" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.current_flange_zone1} unit="A" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.current_flange_zone2} unit="A" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.temp_mold_zone1} unit="°C" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.temp_mold_zone2} unit="°C" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            <span className="text-muted-foreground">1:</span>
                            <SensorValueView sensor={line?.current_mold_zone1} unit="A" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">2:</span>
                            <SensorValueView sensor={line?.current_mold_zone2} unit="A" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.motor_current} unit="A" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.motor_screw_torque} unit="%" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.motor_screw_speed} unit="HZ" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.motor_traction_speed} unit="RPM" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.motor_vacuum_speed} unit="HZ" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.winder_speed} unit="HZ" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.winder_torque} unit="%" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.winder_layer_count} unit="层" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.winder_tube_speed} unit="RPM" />
                      </TableCell>
                      <TableCell>
                        <SensorValueView sensor={line?.winder_tube_count} unit="P" />
                      </TableCell>
                      <TableCell>
                        <span>
                          {line?.timestamp ? new Date(line.timestamp).toLocaleString() : '-'}
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

      {/* 无实时数据状态 */}
      {!realtimeLoading && !hasRealtimeData && (
        <div className="text-center py-12">
          <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">暂无实时数据</h3>
          <p className="text-muted-foreground mb-4">
            请确保生产线设备已连接并开始生产
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • 检查设备连接状态
            </p>
            <p className="text-sm text-muted-foreground">
              • 确认生产线正在运行
            </p>
            <p className="text-sm text-muted-foreground">
              • 验证数据传输服务
            </p>
          </div>
          {realtimeError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                连接错误: {realtimeError}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 加载状态 */}
      {realtimeLoading && lineIds.filter(lineId => realtimeDataMap.get(lineId)).length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">正在连接实时数据</h3>
          <p className="text-muted-foreground">正在建立与生产线设备的连接...</p>
        </div>
      )}
    </div>
  )
}