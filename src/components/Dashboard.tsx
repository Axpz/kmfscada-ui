'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts'
import { useProductionData } from '../hooks'
import type { ProductionData } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Loader2, Activity, CheckCircle, Clock, AlertCircle, TrendingUp, Factory, Zap, Gauge } from 'lucide-react'

// Chart placeholder component
const ChartPlaceholder = ({ text }: { text: string }) => (
  <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20">
    <div className="text-center">
      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{text}</p>
    </div>
  </div>
)

// Production Line Content Component
const ProductionLineContent = ({ lineNum }: { lineNum: number }) => {
  const totalOutput = 1234567 + lineNum * 1000
  const dailyYieldRate = (98.5 - lineNum * 0.1)
  const equipmentUtilization = (92.3 - lineNum * 0.2)
  const energyConsumption = 12345 + lineNum * 100

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">总产量</p>
                <p className="text-2xl font-bold text-green-600">{totalOutput.toLocaleString()}</p>
              </div>
              <Factory className="h-8 w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">良品率</p>
                <p className="text-2xl font-bold text-blue-600">{dailyYieldRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">设备稼动率</p>
                <p className="text-2xl font-bold text-purple-600">{equipmentUtilization.toFixed(1)}%</p>
              </div>
              <Gauge className="h-8 w-8 text-purple-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">能耗</p>
                <p className="text-2xl font-bold text-orange-600">{energyConsumption.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">kWh</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>生产线 {lineNum} 实时趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder text="实时趋势图表" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>设备状态监控</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder text="设备状态图表" />
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle>生产线 {lineNum} 最新事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">设备 A 温度异常</span>
              </div>
              <span className="text-xs text-muted-foreground">1分钟前</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">生产任务开始</span>
              </div>
              <span className="text-xs text-muted-foreground">5分钟前</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">传感器 B 离线</span>
              </div>
              <span className="text-xs text-muted-foreground">10分钟前</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [selectedLine, setSelectedLine] = useState(1)
  const { 
    data: productionDataResponse, 
    isLoading, 
    error 
  } = useProductionData()

  const productionData: ProductionData[] = productionDataResponse?.lines || []
  const errorMessage = error?.message || productionDataResponse?.error

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">未认证</h1>
              <p className="text-muted-foreground">请登录以访问数据看板</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">数据看板</h1>
          <p className="text-muted-foreground">实时生产数据监控与分析</p>
        </div>
        <Button variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          刷新数据
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总产量</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{productionData.length || 2}</div>
            <p className="text-xs text-muted-foreground mt-1">
              STM1 静态数据
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃生产线</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              共 4 条生产线
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground mt-1">
              运行时间 99.9%
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">告警数量</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 个警告, 1 个信息
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Production Line Content */}
      <ProductionLineContent lineNum={selectedLine} />

      {/* Production Data Table */}
      {productionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              生产数据详情
            </CardTitle>
            <p className="text-sm text-muted-foreground">实时生产监控数据</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">加载生产数据中...</p>
              </div>
            ) : errorMessage ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>数值</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.value}</span>
                            <Badge variant={item.value > 0 ? "default" : "secondary"}>
                              {item.value > 0 ? "活跃" : "非活跃"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(() => {
                              const dateStr = item.updated_at ?? item.created_at;
                              const dateObj = dateStr ? new Date(dateStr) : undefined;
                              return <>
                                <p>{dateObj ? dateObj.toLocaleDateString() : 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{dateObj ? dateObj.toLocaleTimeString() : 'N/A'}</p>
                              </>;
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.value > 0 ? "default" : "secondary"}>
                            {item.value > 0 ? "在线" : "离线"}
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
      )}
    </div>
  )
} 