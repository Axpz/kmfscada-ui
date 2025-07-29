'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ChartCard } from './ui/chart-card'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Map, 
  TrendingUp, 
  Eye, 
  RefreshCw
} from 'lucide-react'

// Chart placeholder component
const ChartPlaceholder = ({ 
  title, 
  icon: Icon, 
  description,
  height = "h-64"
}: { 
  title: string
  icon: React.ElementType
  description: string
  height?: string
}) => (
  <div className={`${height} bg-muted/30 rounded-md flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 hover:bg-muted/40 transition-colors`}>
    <Icon className="h-12 w-12 mb-4 opacity-50" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-center max-w-xs">{description}</p>
  </div>
)

interface VisualizationCenterProps {
  showTitle?: boolean
}

export default function VisualizationCenter({ showTitle = false }: VisualizationCenterProps) {
  const [timeRange, setTimeRange] = useState('24h')
  const [chartType, setChartType] = useState('all')

  return (
    <div className="space-y-6">
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Eye className="h-8 w-8" />
              可视化中心
            </h1>
            <p className="text-muted-foreground">数据可视化与分析展示</p>
          </div>
        </div>
      )}
      
      {/* 统一控制面板 - 与DataStatisticsAnalysis保持一致 */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          {/* 左侧：选择器组 */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            {/* 时间范围选择器 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                时间范围
              </span>
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
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                图表类型
              </span>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="production">生产数据</SelectItem>
                  <SelectItem value="quality">质量指标</SelectItem>
                  <SelectItem value="equipment">设备状态</SelectItem>
                  <SelectItem value="energy">能耗分析</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 右侧：状态和操作 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                系统状态
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">实时更新</Badge>
                <Badge variant="secondary">12个图表</Badge>
                <Button variant="outline" size="sm" className="h-8">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  刷新
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃图表</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">数据源</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">更新频率</p>
                <p className="text-2xl font-bold text-purple-600">5s</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">系统状态</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">正常</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="生产趋势分析"
          subtitle="显示生产线产量变化趋势"
          icon={LineChart}
          iconColor="text-blue-500"
        >
          <ChartPlaceholder
            title="折线图"
            icon={LineChart}
            description="此处显示生产线产量随时间变化的趋势图表"
          />
        </ChartCard>

        <ChartCard
          title="设备状态分布"
          subtitle="各设备运行状态占比"
          icon={PieChart}
          iconColor="text-green-500"
        >
          <ChartPlaceholder
            title="饼图"
            icon={PieChart}
            description="显示正常、警告、故障设备的分布比例"
          />
        </ChartCard>

        <ChartCard
          title="能耗对比分析"
          subtitle="各生产线能耗对比"
          icon={BarChart3}
          iconColor="text-purple-500"
        >
          <ChartPlaceholder
            title="柱状图"
            icon={BarChart3}
            description="对比各生产线的能源消耗情况"
          />
        </ChartCard>
      </div>

      {/* Main Visualization Area */}
      <ChartCard
        title="车间布局可视化"
        subtitle="实时显示车间设备分布和状态"
        icon={Map}
        iconColor="text-orange-500"
      >
        <ChartPlaceholder
          title="车间地图可视化"
          icon={Map}
          description="此处显示车间平面图，包含各设备位置、状态指示器和实时数据展示"
          height="h-96"
        />
      </ChartCard>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="质量指标趋势"
          subtitle="产品质量指标变化"
          icon={TrendingUp}
          iconColor="text-red-500"
        >
          <ChartPlaceholder
            title="质量趋势图"
            icon={TrendingUp}
            description="显示良品率、次品率等质量指标的时间序列变化"
          />
        </ChartCard>

        <ChartCard
          title="设备效率分析"
          subtitle="设备运行效率对比"
          icon={BarChart3}
          iconColor="text-cyan-500"
        >
          <ChartPlaceholder
            title="效率对比图"
            icon={BarChart3}
            description="对比各设备的运行效率和利用率指标"
          />
        </ChartCard>
      </div>

      {/* Real-time Data Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            实时数据流
          </CardTitle>
          <p className="text-sm text-muted-foreground">最新的系统数据更新</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">生产线 1 产量更新</span>
              </div>
              <span className="text-xs text-muted-foreground">刚刚</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">设备状态监控更新</span>
              </div>
              <span className="text-xs text-muted-foreground">5秒前</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm">能耗数据同步完成</span>
              </div>
              <span className="text-xs text-muted-foreground">10秒前</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}