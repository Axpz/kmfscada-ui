'use client'

import React, { useState } from 'react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { ProductionLineData } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import {
    Download,
    FileSpreadsheet,
    Loader2,
    Calendar,
    Settings,
    AlertCircle,
    Droplet,
    Thermometer,
    Zap,
    Cog,
} from 'lucide-react'
import { useSensorDataExport } from '@/hooks/useSensorData'
import { SensorDataExportFilter } from '@/lib/api-sensor-data'


// 生产业务数据字段
const PRODUCTION_BUSINESS_CATEGORIES = {
    label: '生产业务数据',
    icon: FileSpreadsheet,
    fields: [
        { value: 'batch_product_number', label: '生产批号' },
        { value: 'current_length', label: '生产长度 (米)' },
        { value: 'target_length', label: '设定长度 (米)' },
        { value: 'diameter', label: '实时直径 (mm)' },
    ]
}

// 环境数据字段
const ENVIRONMENT_CATEGORIES = {
    label: '环境数据',
    icon: Droplet,
    fields: [
        { value: 'fluoride_concentration', label: '氟离子浓度 (mg/L)' },
    ]
}

// 温度传感器组字段
const TEMPERATURE_CATEGORIES = {
    label: '温度传感器组 (°C)',
    icon: Thermometer,
    fields: [
        { value: 'temp_body_zone1', label: '机身温度区域1' },
        { value: 'temp_body_zone2', label: '机身温度区域2' },
        { value: 'temp_body_zone3', label: '机身温度区域3' },
        { value: 'temp_body_zone4', label: '机身温度区域4' },
        { value: 'temp_flange_zone1', label: '法兰温度区域1' },
        { value: 'temp_flange_zone2', label: '法兰温度区域2' },
        { value: 'temp_mold_zone1', label: '模具温度区域1' },
        { value: 'temp_mold_zone2', label: '模具温度区域2' },
    ]
}

// 电流传感器组字段
const CURRENT_CATEGORIES = {
    label: '电流传感器组 (A)',
    icon: Zap,
    fields: [
        { value: 'current_body_zone1', label: '机身电流区域1' },
        { value: 'current_body_zone2', label: '机身电流区域2' },
        { value: 'current_body_zone3', label: '机身电流区域3' },
        { value: 'current_body_zone4', label: '机身电流区域4' },
        { value: 'current_flange_zone1', label: '法兰电流区域1' },
        { value: 'current_flange_zone2', label: '法兰电流区域2' },
        { value: 'current_mold_zone1', label: '模具电流区域1' },
        { value: 'current_mold_zone2', label: '模具电流区域2' },
    ]
}

// 电机参数字段
const MOTOR_CATEGORIES = {
    label: '电机参数',
    icon: Cog,
    fields: [
        { value: 'motor_screw_speed', label: '螺杆转速 (rpm)' },
        { value: 'motor_screw_torque', label: '螺杆扭矩' },
        { value: 'motor_current', label: '电机电流 (A)' },
        { value: 'motor_traction_speed', label: '牵引速度 (m/min)' },
        { value: 'motor_vacuum_speed', label: '真空速度' },
    ]
}

// 收卷机字段
const WINDER_CATEGORIES = {
    label: '收卷机',
    icon: Cog,
    fields: [
        { value: 'winder_speed', label: '收卷速度' },
        { value: 'winder_torque', label: '收卷扭矩' },
        { value: 'winder_layer_count', label: '收卷层数' },
        { value: 'winder_tube_speed', label: '收卷管速度' },
        { value: 'winder_tube_count', label: '收卷管数量' },
    ]
}

// 生产线类别配置
const PRODUCTION_LINE_CATEGORY = {
    label: '选择生产线',
    icon: Settings,
}

// 获取所有字段的扁平数组
const getAllFields = () => {
    return [
        ...PRODUCTION_BUSINESS_CATEGORIES.fields,
        ...TEMPERATURE_CATEGORIES.fields,
        ...CURRENT_CATEGORIES.fields,
        ...MOTOR_CATEGORIES.fields,
        ...WINDER_CATEGORIES.fields
    ]
}

export default function DataExport() {
    const { data: productionLines, isLoading, error } = useAvailableProductionLines()
    const { mutate: createExport, isPending} = useSensorDataExport()

    const [selectedLines, setSelectedLines] = useState<string[]>([])
    const [selectedFields, setSelectedFields] = useState<string[]>([])
    const [exportFormat] = useState<'xlsx'>('xlsx')
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    // 全选生产线
    const handleSelectAllLines = (checked: boolean) => {
        if (checked && productionLines?.items) {
            setSelectedLines(productionLines.items.map(line => line.name.toString()))
        } else {
            setSelectedLines([])
        }
    }

    // 按类别全选字段
    const handleSelectCategoryFields = (categoryType: 'production' | 'temperature' | 'current' | 'motor' | 'winder' | 'environment', checked: boolean) => {
        const categoryFields = categoryType === 'production'
            ? PRODUCTION_BUSINESS_CATEGORIES.fields
            : categoryType === 'temperature'
            ? TEMPERATURE_CATEGORIES.fields
            : categoryType === 'current'
            ? CURRENT_CATEGORIES.fields
            : categoryType === 'motor'
            ? MOTOR_CATEGORIES.fields
            : categoryType === 'winder'
            ? WINDER_CATEGORIES.fields
            : ENVIRONMENT_CATEGORIES.fields

        if (checked) {
            setSelectedFields(prev => [
                ...prev.filter(field => !categoryFields.some(f => f.value === field)),
                ...categoryFields.map(field => field.value)
            ])
        } else {
            setSelectedFields(prev =>
                prev.filter(field => !categoryFields.some(f => f.value === field))
            )
        }
    }

    // 检查是否全选
    const isAllLinesSelected = productionLines?.items ? selectedLines.length === productionLines.items.length : false
    const isALineSelected = selectedLines.length > 0

    // 检查类别是否全选
    const isCategorySelected = (categoryType: 'production' | 'temperature' | 'current' | 'motor' | 'winder' | 'environment') => {
        const categoryFields = categoryType === 'production'
            ? PRODUCTION_BUSINESS_CATEGORIES.fields
            : categoryType === 'temperature'
            ? TEMPERATURE_CATEGORIES.fields
            : categoryType === 'current'
            ? CURRENT_CATEGORIES.fields
            : categoryType === 'motor'
            ? MOTOR_CATEGORIES.fields
            : categoryType === 'winder'
            ? WINDER_CATEGORIES.fields
            : ENVIRONMENT_CATEGORIES.fields
        return categoryFields.every(field => selectedFields.includes(field.value))
    }

    const handleExport = () => {
        if (
            !dateRange?.from || 
            !dateRange?.to || 
            ((selectedLines.length === 0 || selectedFields.length === 0) && selectedFields.filter(field => field === 'fluoride_concentration').length === 0)
        )
        {
            toast.error('请确认已选择生产线和数据字段！')
            return
        }

        const filters: SensorDataExportFilter = {
            line_ids: selectedLines.join(','),
            start_time: format(dateRange.from, 'yyyy-MM-dd'),
            end_time: format(dateRange.to, 'yyyy-MM-dd'),
            parameter_names: selectedFields.join(','),
        }

        createExport(filters, {
            onSuccess: () => toast.success('已创建新的导出文件！请在导出历史中查看状态。'),
            onError: (err) => toast.error(`导出失败: ${err.message}`),
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-destructive/10 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-semibold text-destructive">加载生产线数据失败</h2>
                <p className="mt-2 text-muted-foreground">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            {/* 页面头部 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">创建导出</h2>
                    <p className="text-sm text-muted-foreground">
                        选择时间范围、生产线和数据字段来创建导出任务
                    </p>
                </div>
            </div>

            {/* 导出配置表单 */}
            <div className="space-y-6 md:space-y-8">
                {/* 时间范围配置 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">选择时间范围</h3>
                        <span className="text-destructive">*</span>
                    </div>
                    <div className="grid gap-2">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            className="w-full max-w-xs"
                        />
                    </div>
                </div>

                {/* 数据选择 */}
                <div className="space-y-4 md:space-y-6">
                    {/* 环境数据字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ENVIRONMENT_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{ENVIRONMENT_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-environment"
                                    checked={isCategorySelected('environment')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('environment', checked as boolean)}
                                />
                                <Label htmlFor="select-all-environment" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {ENVIRONMENT_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 生产线选择 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{PRODUCTION_LINE_CATEGORY.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-lines"
                                    checked={isAllLinesSelected}
                                    onCheckedChange={handleSelectAllLines}
                                />
                                <Label htmlFor="select-all-lines" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {productionLines?.items?.map(line => (
                                <div key={line.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`line-${line.name}`}
                                        checked={selectedLines.includes(line.name.toString())}
                                        onCheckedChange={(checked) => {
                                            setSelectedLines(prev =>
                                                checked
                                                    ? [...prev, line.name.toString()]
                                                    : prev.filter(name => name !== line.name.toString())
                                            )
                                        }}
                                    />
                                    <Label htmlFor={`line-${line.name}`} className="text-sm">
                                        {line.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 生产业务数据字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PRODUCTION_BUSINESS_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{PRODUCTION_BUSINESS_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-production"
                                    checked={isCategorySelected('production')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('production', checked as boolean)}
                                    disabled={!isALineSelected}
                                />
                                <Label htmlFor="select-all-production" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {PRODUCTION_BUSINESS_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                        disabled={!isALineSelected}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 温度传感器组字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TEMPERATURE_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{TEMPERATURE_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-temperature"
                                    checked={isCategorySelected('temperature')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('temperature', checked as boolean)}
                                    disabled={!isALineSelected}
                                />
                                <Label htmlFor="select-all-temperature" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {TEMPERATURE_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                        disabled={!isALineSelected}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 电流传感器组字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CURRENT_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{CURRENT_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-current"
                                    checked={isCategorySelected('current')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('current', checked as boolean)}
                                    disabled={!isALineSelected}
                                />
                                <Label htmlFor="select-all-current" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {CURRENT_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                        disabled={!isALineSelected}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 电机参数字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MOTOR_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{MOTOR_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-motor"
                                    checked={isCategorySelected('motor')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('motor', checked as boolean)}
                                    disabled={!isALineSelected}
                                />
                                <Label htmlFor="select-all-motor" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {MOTOR_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                        disabled={!isALineSelected}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 收卷机字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WINDER_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{WINDER_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-winder"
                                    checked={isCategorySelected('winder')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('winder', checked as boolean)}
                                    disabled={!isALineSelected}
                                />
                                <Label htmlFor="select-all-winder" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 md:pl-6">
                            {WINDER_CATEGORIES.fields.map(field => (
                                <div key={field.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.value}`}
                                        checked={selectedFields.includes(field.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFields(prev =>
                                                checked
                                                    ? [...prev, field.value]
                                                    : prev.filter(v => v !== field.value)
                                            )
                                        }}
                                        disabled={!isALineSelected}
                                    />
                                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 导出格式显示 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">导出格式</h3>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Excel (.xlsx)</span>
                    </div>
                </div>

                {/* 导出按钮 */}
                <div className="pt-4 md:pt-6 flex justify-center">
                    <Button
                        onClick={handleExport}
                        disabled={
                            (
                                isPending || 
                                !dateRange?.from || 
                                !dateRange?.to || 
                                selectedLines.length === 0 || selectedFields.length === 0
                            ) && selectedFields.filter(field => field === 'fluoride_concentration').length === 0
                        }
                        className="h-10 w-full sm:w-auto"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Download className="mr-2 h-4 w-4" />
                        导出
                    </Button>
                </div>
            </div>
        </div>
    )
}