'use client'

import React, { useState } from 'react'
import { MultiSelect } from '@/components/ui/multi-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProductionData } from '@/hooks/useApi'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MultiSelectDemo() {
  const { data: productionLines, isLoading: isLoadingLines } = useProductionData()
  
  // 单选状态
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  
  // 多选状态
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])

  const productionLineOptions = productionLines?.map(line => ({
    value: line.production_line_id,
    label: `生产线 #${line.production_line_id}`,
  })) || []

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">MultiSelect 组件演示</h1>
        <p className="text-muted-foreground">
          对比单选和多选生产线选择器的效果
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 单选演示 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">单选模式</CardTitle>
            <CardDescription>
              传统的单选下拉框，一次只能选择一个生产线
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                生产线
              </Label>
              {isLoadingLines ? (
                <LoadingSpinner />
              ) : (
                <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                  <SelectTrigger className="w-48 h-8">
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
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">当前选择:</Label>
              <div className="mt-2">
                {selectedLineId ? (
                  <Badge variant="secondary">
                    生产线 #{selectedLineId}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">未选择</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 多选演示 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">多选模式</CardTitle>
            <CardDescription>
              新的多选组件，可以同时选择多个生产线进行对比分析
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                生产线
              </Label>
              {isLoadingLines ? (
                <LoadingSpinner />
              ) : (
                <MultiSelect
                  options={productionLineOptions}
                  value={selectedLineIds}
                  onValueChange={setSelectedLineIds}
                  placeholder="选择生产线"
                  className="w-48"
                  maxCount={5}
                  maxDisplay={1}
                />
              )}
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">当前选择 ({selectedLineIds.length}):</Label>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedLineIds.length > 0 ? (
                  selectedLineIds.map(lineId => (
                    <Badge key={lineId} variant="secondary">
                      生产线 #{lineId}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">未选择</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 功能特性说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MultiSelect 组件特性</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✨ 核心功能</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 多选支持，可同时选择多个选项</li>
                <li>• Badge 显示选中项，支持单独移除</li>
                <li>• 智能显示策略，避免界面过于拥挤</li>
                <li>• 支持最大选择数量限制</li>
                <li>• 一键清除所有选择</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎨 设计特性</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 与 shadcn/ui 设计系统完全一致</li>
                <li>• 支持禁用状态和选项禁用</li>
                <li>• 响应式设计，适配不同屏幕尺寸</li>
                <li>• 平滑的动画和交互反馈</li>
                <li>• 可访问性支持</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用示例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用示例</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`import { MultiSelect } from '@/components/ui/multi-select'

const [selectedIds, setSelectedIds] = useState<string[]>([])

<MultiSelect
  options={[
    { value: '1', label: '生产线 #1' },
    { value: '2', label: '生产线 #2' },
    { value: '3', label: '生产线 #3', disabled: true },
  ]}
  value={selectedIds}
  onValueChange={setSelectedIds}
  placeholder="选择生产线"
  maxCount={3}
  maxDisplay={2}
  className="w-48"
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}