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
  ChevronRight,
} from 'lucide-react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { useWebSocket } from '@/hooks/useWebsocket'

interface VisualizationCenterProps {
  showTitle?: boolean
}


export default function VisualizationCenter({ showTitle = false }: VisualizationCenterProps) {
  const [realtimeLoading, setRealtimeLoading] = useState(true)
  const [realtimeError, setRealtimeError] = useState<string | null>(null)
  const [expandedLine, setExpandedLine] = useState<string | null>(null)

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
      <div className="flex justify-center items-center py-8 px-4">
        <RefreshCw className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm md:text-base text-muted-foreground">加载可视化数据中...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full space-y-3 md:space-y-6 px-2 md:px-0">
      {/* 移动端：卡片式布局 */}
      <div className="block md:hidden space-y-3">
        {productionLinesWithData.map(({ lineId, data: line, hasData }) => (
          <Card key={lineId} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">{line?.line_id || lineId}</span>
                </div>
                <StatusBadge status={getProductionStatus(line?.motor_screw_speed)} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-row gap-3">
                  <div className="mb-1">生产批号:</div>
                  <div className=" text-green-500">{line?.batch_product_number || '-'}</div>
                </div>
                <div className="flex flex-row gap-3">
                  <div className="mb-1">当前直径:</div>
                  <SensorValueView sensor={line?.diameter} unit="mm" />
                </div>
                <div className="flex flex-row gap-3">
                  <div className="mb-1">当前米数:</div>
                  <SensorValueView sensor={line?.current_length} unit="m" />
                </div>
                <div className="flex flex-row gap-3">
                  <div className="mb-1">长度设定:</div>
                  <SensorValueView sensor={line?.target_length} unit="m" />
                </div>
              </div>
              
              <button
                onClick={() => setExpandedLine(expandedLine === lineId ? null : lineId)}
                className="flex items-center justify-center w-full py-2 text-xs text-muted-foreground border-t"
              >
                <span>传感器详情</span>
                <ChevronRight 
                  className={`h-3 w-3 ml-1 transition-transform ${
                    expandedLine === lineId ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              {expandedLine === lineId && (
                <div className="border-t pt-3 space-y-2 text-xs">
                  {/* 主要传感器数据 - 按指定顺序 */}
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">传感器数据</h5>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">主机电流:</span>
                        <SensorValueView sensor={line?.motor_current} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">主机扭力:</span>
                        <SensorValueView sensor={line?.motor_screw_torque} unit="%" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">主机速度:</span>
                        <SensorValueView sensor={line?.motor_screw_speed} unit="HZ" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">牵引速度:</span>
                        <SensorValueView sensor={line?.motor_traction_speed} unit="RPM" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">真空速度:</span>
                        <SensorValueView sensor={line?.motor_vacuum_speed} unit="HZ" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">收卷速度:</span>
                        <SensorValueView sensor={line?.winder_speed} unit="HZ" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">收卷扭力:</span>
                        <SensorValueView sensor={line?.winder_torque} unit="%" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">排管层数:</span>
                        <SensorValueView sensor={line?.winder_layer_count} unit="层" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">排管速度:</span>
                        <SensorValueView sensor={line?.winder_tube_speed} unit="RPM" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">排管根数:</span>
                        <SensorValueView sensor={line?.winder_tube_count} unit="P" />
                      </div>
                    </div>
                  </div>

                  {/* 温度/电流监控 */}
                  <div className="border-t pt-2">
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">温度/电流监控</h5>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒1温度:</span>
                        <SensorValueView sensor={line?.temp_body_zone1} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒1电流:</span>
                        <SensorValueView sensor={line?.current_body_zone1} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒2温度:</span>
                        <SensorValueView sensor={line?.temp_body_zone2} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒2电流:</span>
                        <SensorValueView sensor={line?.current_body_zone2} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒3温度:</span>
                        <SensorValueView sensor={line?.temp_body_zone3} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒3电流:</span>
                        <SensorValueView sensor={line?.current_body_zone3} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒4温度:</span>
                        <SensorValueView sensor={line?.temp_body_zone4} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">机筒4电流:</span>
                        <SensorValueView sensor={line?.current_body_zone4} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">法兰1温度:</span>
                        <SensorValueView sensor={line?.temp_flange_zone1} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">法兰1电流:</span>
                        <SensorValueView sensor={line?.current_flange_zone1} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">法兰2温度:</span>
                        <SensorValueView sensor={line?.temp_flange_zone2} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">法兰2电流:</span>
                        <SensorValueView sensor={line?.current_flange_zone2} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">模具1温度:</span>
                        <SensorValueView sensor={line?.temp_mold_zone1} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">模具1电流:</span>
                        <SensorValueView sensor={line?.current_mold_zone1} unit="A" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">模具2温度:</span>
                        <SensorValueView sensor={line?.temp_mold_zone2} unit="°C" />
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">模具2电流:</span>
                        <SensorValueView sensor={line?.current_mold_zone2} unit="A" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground pt-2 border-t">
                    最后更新: {line?.timestamp ? new Date(line.timestamp).toLocaleString() : '-'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 桌面端：表格布局 */}
      <Card className="w-full hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-5 w-5 text-blue-500" />
              生产线数据和状态
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-max rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>生产线</TableHead>
                  <TableHead>生产批号</TableHead>
                  <TableHead>物料批号</TableHead>
                  <TableHead>当前米数</TableHead>
                  <TableHead>长度设定</TableHead>
                  <TableHead>当前直径</TableHead>
                  {/* <TableHead>氟离子浓度</TableHead> */}
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
                    {/* <TableCell>
                      <SensorValueView sensor={line?.fluoride_concentration} unit="mg/L" />
                    </TableCell> */}
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
          </div>
        </CardContent>
      </Card>


      {/* 桌面端：传感器数据表格 */}
      <Card className="w-full hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-5 w-5 text-green-500" />
              传感器实时数据
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
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
                  <TableHead>当前排管根数</TableHead>
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
          </div>
        </CardContent>
      </Card>

      {/* 无实时数据状态 */}
      {!realtimeLoading && !hasRealtimeData && (
        <div className="text-center py-8 md:py-12 px-4">
          <WifiOff className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
          <h3 className="text-base md:text-lg font-semibold mb-2">暂无实时数据</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
            请确保生产线设备已连接并开始生产
          </p>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground">
              • 检查设备连接状态
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              • 确认生产线正在运行
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              • 验证数据传输服务
            </p>
          </div>
          {realtimeError && (
            <div className="mt-3 md:mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
                连接错误: {realtimeError}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 加载状态 */}
      {realtimeLoading && lineIds.filter(lineId => realtimeDataMap.get(lineId)).length === 0 && (
        <div className="text-center py-8 md:py-12 px-4">
          <RefreshCw className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 animate-spin text-blue-500" />
          <h3 className="text-base md:text-lg font-semibold mb-2">正在连接实时数据</h3>
          <p className="text-sm md:text-base text-muted-foreground">正在建立与生产线设备的连接...</p>
        </div>
      )}
    </div>
  )
}