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
  const [formData, setFormData] = useState<ProductionData>({
    production_line_id: item?.production_line_id || '1',
    production_batch_number: item?.production_batch_number || '',
    material_batch_number: item?.material_batch_number || '',
    body_temperatures: item?.body_temperatures || [180, 185, 190, 195],
    flange_temperatures: item?.flange_temperatures || [160, 165],
    mold_temperatures: item?.mold_temperatures || [200, 210],
    screw_motor_speed: item?.screw_motor_speed || 75,
    traction_motor_speed: item?.traction_motor_speed || 10,
    real_time_diameter: item?.real_time_diameter || 22.5,
    total_length_produced: item?.total_length_produced || 1000,
    fluoride_ion_concentration: item?.fluoride_ion_concentration || 1.5,
    main_spindle_current: item?.main_spindle_current || 20,
  })

  const createMutation = useCreateProductionData()
  const updateMutation = useUpdateProductionData()

  const isEditing = !!item
  const isLoading = isEditing ? updateMutation.isPending : createMutation.isPending
  const error = isEditing ? updateMutation.error : createMutation.error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing && item) {
        // 假设我们有一个 ID 字段用于更新
        await updateMutation.mutateAsync({ id: '1', data: formData })
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
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: ['screw_motor_speed', 'traction_motor_speed', 'real_time_diameter', 'main_spindle_current', 'fluoride_ion_concentration'].includes(field) 
        ? parseFloat(value) || 0 
        : value,
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
                <Label htmlFor="production_batch_number" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  生产批次号
                </Label>
                <Input
                  type="text"
                  id="production_batch_number"
                  value={formData.production_batch_number}
                  onChange={handleChange('production_batch_number')}
                  required
                  placeholder="请输入生产批次号"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  输入生产批次的唯一标识号
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material_batch_number" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  物料批次号
                </Label>
                <Input
                  type="text"
                  id="material_batch_number"
                  value={formData.material_batch_number}
                  onChange={handleChange('material_batch_number')}
                  required
                  placeholder="请输入物料批次号"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  输入物料批次的唯一标识号
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="screw_motor_speed" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  螺杆电机转速 (rpm)
                </Label>
                <Input
                  type="number"
                  id="screw_motor_speed"
                  value={formData.screw_motor_speed}
                  onChange={handleChange('screw_motor_speed')}
                  step="0.1"
                  placeholder="请输入螺杆电机转速"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="traction_motor_speed" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  牵引机速度 (m/min)
                </Label>
                <Input
                  type="number"
                  id="traction_motor_speed"
                  value={formData.traction_motor_speed}
                  onChange={handleChange('traction_motor_speed')}
                  step="0.1"
                  placeholder="请输入牵引机速度"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="real_time_diameter" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  实时直径 (mm)
                </Label>
                <Input
                  type="number"
                  id="real_time_diameter"
                  value={formData.real_time_diameter}
                  onChange={handleChange('real_time_diameter')}
                  step="0.001"
                  placeholder="请输入实时直径"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_spindle_current" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  主轴电流 (A)
                </Label>
                <Input
                  type="number"
                  id="main_spindle_current"
                  value={formData.main_spindle_current}
                  onChange={handleChange('main_spindle_current')}
                  step="0.1"
                  placeholder="请输入主轴电流"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fluoride_concentration" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                氟离子浓度 (mg/L)
              </Label>
              <Input
                type="number"
                id="fluoride_concentration"
                value={formData.fluoride_ion_concentration}
                onChange={handleChange('fluoride_ion_concentration')}
                step="0.01"
                placeholder="请输入氟离子浓度"
                className="transition-all duration-200 focus:scale-[1.02]"
              />
              <p className="text-xs text-muted-foreground">
                输入氟离子浓度值，用于水质监控
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