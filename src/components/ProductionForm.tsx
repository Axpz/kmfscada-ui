'use client'

import React, { useState } from 'react'
import { useCreateProductionData, useUpdateProductionData } from '../hooks'
import type { ProductionData } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, AlertCircle, Database, Hash, FileText, Save, X } from 'lucide-react'

interface ProductionFormProps {
  item?: ProductionData
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ProductionForm({ item, onSuccess, onCancel }: ProductionFormProps) {
  const [formData, setFormData] = useState<Omit<ProductionData, 'id' | 'created_at' | 'updated_at'>>({
    value: item?.value || 0,
    unit: item?.unit || '',
    description: item?.description || '',
  })

  const createMutation = useCreateProductionData()
  const updateMutation = useUpdateProductionData()

  const isEditing = !!item
  const isLoading = isEditing ? updateMutation.isPending : createMutation.isPending
  const error = isEditing ? updateMutation.error : createMutation.error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing && item?.id) {
        await updateMutation.mutateAsync({ id: item.id, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error saving production data:', error)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'value' ? parseFloat(e.target.value) || 0 : e.target.value,
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? '编辑生产数据' : '添加生产数据'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? '修改现有的生产数据记录' : '创建新的生产数据记录'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">数据管理</span>
        </div>
      </div>

      <Card className="animate-fadeInUp">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            生产数据表单
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            请填写完整的生产数据信息
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  数值
                </Label>
                <Input
                  type="number"
                  id="value"
                  value={formData.value}
                  onChange={handleChange('value')}
                  step="0.01"
                  required
                  placeholder="请输入数值"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  输入生产数据的具体数值
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  单位
                </Label>
                <Input
                  type="text"
                  id="unit"
                  value={formData.unit}
                  onChange={handleChange('unit')}
                  required
                  placeholder="例如: kW, °C, mg/L"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  指定数值的计量单位
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange('description')}
                rows={4}
                required
                placeholder="请详细描述这个生产数据的用途和含义..."
                className="transition-all duration-200 focus:scale-[1.01] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                提供详细的数据描述，便于后续查看和管理
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-fadeInUp">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  保存生产数据时出错: {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? '更新中...' : '创建中...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? '更新数据' : '创建数据'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 