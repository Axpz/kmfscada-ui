'use client'

import React, { useState } from 'react'
import { useProductionData, useCreateExportTask } from '@/hooks/useApi'
import { DataExportConfig, ProductionDataPoint } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import {
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Calendar,
    Settings,
    AlertCircle,
} from 'lucide-react'

// 生产信息字段
const PROD_FIELD_CATEGORIES = {
    label: '选择生产信息',
    icon: FileSpreadsheet,
    fields: [
        { value: 'batch_number', label: '生产批号' },
        { value: 'total_length_produced', label: '生产长度' },
        { value: 'fluoride_ion_concentration', label: '氟离子浓度' },
    ]
}

// 工艺参数字段
const PROD_PROCESS_CATEGORIES = {
    label: '选择工艺参数',
    icon: Settings,
    fields: [
        { value: 'body_temperatures', label: '机身温度' },
        { value: 'flange_temperatures', label: '法兰温度' },
        { value: 'mold_temperatures', label: '模具温度' },
        { value: 'screw_motor_speed', label: '螺杆转速' },
        { value: 'traction_motor_speed', label: '牵引速度' },
        { value: 'real_time_diameter', label: '实时直径' },
        { value: 'main_spindle_current', label: '主轴电流' },
    ]
}

// 生产线类别配置
const PRODUCTION_LINE_CATEGORY = {
    label: '选择生产线',
    icon: Settings,
}

// 获取所有字段的扁平数组
const getAllFields = () => {
    return [...PROD_FIELD_CATEGORIES.fields, ...PROD_PROCESS_CATEGORIES.fields]
}

export default function DataExport() {
    const { data: productionLines, isLoading, error } = useProductionData()
    const { mutate: createExport, isPending } = useCreateExportTask()

    const [selectedLines, setSelectedLines] = useState<string[]>([])
    const [selectedFields, setSelectedFields] = useState<string[]>([])
    const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx')
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    // 全选生产线
    const handleSelectAllLines = (checked: boolean) => {
        if (checked && productionLines) {
            setSelectedLines(productionLines.map(line => line.production_line_id))
        } else {
            setSelectedLines([])
        }
    }



    // 按类别全选字段
    const handleSelectCategoryFields = (categoryType: 'production' | 'process', checked: boolean) => {
        const categoryFields = categoryType === 'production' 
            ? PROD_FIELD_CATEGORIES.fields 
            : PROD_PROCESS_CATEGORIES.fields
        
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
    const isAllLinesSelected = productionLines ? selectedLines.length === productionLines.length : false

    // 检查类别是否全选
    const isCategorySelected = (categoryType: 'production' | 'process') => {
        const categoryFields = categoryType === 'production' 
            ? PROD_FIELD_CATEGORIES.fields 
            : PROD_PROCESS_CATEGORIES.fields
        return categoryFields.every(field => selectedFields.includes(field.value))
    }

    const handleExport = () => {
        if (!dateRange?.from || !dateRange?.to || selectedLines.length === 0 || selectedFields.length === 0) {
            toast.error('请完成所有必填项配置！')
            return
        }

        const config: DataExportConfig = {
            start_time: format(dateRange.from, 'yyyy-MM-dd'),
            end_time: format(dateRange.to, 'yyyy-MM-dd'),
            format: exportFormat,
            fields: selectedFields as (keyof Omit<ProductionDataPoint, 'id' | 'timestamp' | 'production_line_id'>)[],
        }

        createExport(config, {
            onSuccess: () => toast.success('已创建新的导出任务！请在导出历史中查看状态。'),
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
        <div className="space-y-6">
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
            <div className="space-y-8">
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
                            className="max-w-xs"
                        />
                    </div>
                </div>

                {/* 数据选择 */}
                <div className="space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                            {productionLines?.map(line => (
                                <div key={line.production_line_id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`line-${line.production_line_id}`}
                                        checked={selectedLines.includes(line.production_line_id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedLines(prev =>
                                                checked
                                                    ? [...prev, line.production_line_id]
                                                    : prev.filter(id => id !== line.production_line_id)
                                            )
                                        }}
                                    />
                                    <Label htmlFor={`line-${line.production_line_id}`} className="text-sm">
                                        生产线 #{line.production_line_id}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 生产信息字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PROD_FIELD_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{PROD_FIELD_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-production"
                                    checked={isCategorySelected('production')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('production', checked as boolean)}
                                />
                                <Label htmlFor="select-all-production" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                            {PROD_FIELD_CATEGORIES.fields.map(field => (
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

                    {/* 工艺参数字段 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PROD_PROCESS_CATEGORIES.icon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{PROD_PROCESS_CATEGORIES.label}</h3>
                                <span className="text-destructive">*</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-process"
                                    checked={isCategorySelected('process')}
                                    onCheckedChange={(checked) => handleSelectCategoryFields('process', checked as boolean)}
                                />
                                <Label htmlFor="select-all-process" className="text-xs text-muted-foreground">
                                    全选
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                            {PROD_PROCESS_CATEGORIES.fields.map(field => (
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

                    <p className="text-xs text-muted-foreground">
                        选择要导出的生产线和数据字段类型
                    </p>
                </div>

                {/* 导出格式选择 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">选择导出格式</h3>
                        <span className="text-destructive">*</span>
                    </div>
                    <div className="grid gap-2">
                        <Select value={exportFormat} onValueChange={(v: 'csv' | 'xlsx') => setExportFormat(v)}>
                            <SelectTrigger className="max-w-xs h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="xlsx">
                                    <div className="flex items-center">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel (.xlsx)
                                    </div>
                                </SelectItem>
                                <SelectItem value="csv">
                                    <div className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4" />
                                        CSV (.csv)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 导出按钮 */}
                <div className="pt-6 flex justify-center">
                    <Button
                        onClick={handleExport}
                        disabled={isPending || !dateRange?.from || !dateRange?.to || selectedLines.length === 0 || selectedFields.length === 0}
                        className="h-10"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Download className="mr-2 h-4 w-4" />
                        导出
                    </Button>
                </div>
            </div>

            {/* 空状态提示 */}
            {productionLines?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无可用的生产线数据</p>
                </div>
            )}
        </div>
    )
}