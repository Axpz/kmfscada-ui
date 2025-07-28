'use client'

import React, { useState } from 'react'
import { useProductionData, useExportHistory, useCreateExportTask } from '@/hooks/useApi'
import { DataExportConfig, ExportTask, ProductionDataPoint } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react'

const DATA_TYPE_OPTIONS = [
  { value: 'body_temperatures', label: '机身温度' },
  { value: 'flange_temperatures', label: '法兰温度' },
  { value: 'mold_temperatures', label: '模具温度' },
  { value: 'screw_motor_speed', label: '螺杆转速' },
  { value: 'traction_motor_speed', label: '牵引速度' },
  { value: 'real_time_diameter', label: '实时直径' },
  { value: 'total_length_produced', label: '生产长度' },
  { value: 'fluoride_ion_concentration', label: '氟离子浓度' },
  { value: 'main_spindle_current', label: '主轴电流' },
]

const ExportHistoryTable = () => {
  const { data: tasks, isLoading, error } = useExportHistory()

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }
  if (error) {
    return <div className="text-red-500 p-4">加载导出历史失败: {error.message}</div>
  }

  const getStatusBadge = (status: ExportTask['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
    } as const
    const labels = {
      pending: '等待中',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
    }
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'completed' && <CheckCircle className="h-3 w-3" />}
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border w-full">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>状态</TableHead>
              <TableHead>时间范围</TableHead>
              <TableHead className="hidden sm:table-cell">格式</TableHead>
              <TableHead className="hidden md:table-cell">创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task: ExportTask) => (
              <TableRow key={task.id}>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell className="text-sm">
                  {task.config?.start_time && task.config?.end_time ? (
                    <>
                      {format(new Date(task.config.start_time), 'yy-MM-dd')} to {format(new Date(task.config.end_time), 'yy-MM-dd')}
                    </>
                  ) : (
                    <span className="text-muted-foreground">配置缺失</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {task.config?.format ? task.config.format.toUpperCase() : '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(task.createdAt || task.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {task.status === 'completed' && (task.downloadUrl || task.download_url) ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={task.downloadUrl || task.download_url} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" /> 下载
                      </a>
                    </Button>
                  ) : task.status === 'failed' ? (
                    <span className="text-sm text-destructive">
                      {task.error_message || '导出失败'}
                    </span>
                  ) : task.status === 'processing' ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      处理中...
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function DataExportCenter() {
  const { data: productionLines } = useProductionData()
  const { mutate: createExport, isPending } = useCreateExportTask()

  const [selectedLines, setSelectedLines] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

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
      // This needs to be adapted based on backend expectation. Assuming it wants line IDs.
      // production_line_ids: selectedLines, 
    }

    createExport(config, {
      onSuccess: () => toast.success('已创建新的导出任务！请在历史记录中查看状态。'),
      onError: (err) => toast.error(`导出失败: ${err.message}`),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">数据导出中心</h1>
        <p className="text-muted-foreground">选择并导出指定时间范围内的生产数据。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter />导出配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>时间范围</Label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <div className="space-y-2">
                <Label>生产线</Label>
                <div className="space-y-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                  {productionLines?.map(line => (
                    <div key={line.production_line_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`line-${line.production_line_id}`}
                        onCheckedChange={(checked) => {
                          setSelectedLines(prev =>
                            checked
                              ? [...prev, line.production_line_id]
                              : prev.filter(id => id !== line.production_line_id)
                          )
                        }}
                      />
                      <Label htmlFor={`line-${line.production_line_id}`}>生产线 #{line.production_line_id}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>数据字段</Label>
                <div className="space-y-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                  {DATA_TYPE_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-${option.value}`}
                        onCheckedChange={(checked) => {
                          setSelectedFields(prev =>
                            checked
                              ? [...prev, option.value]
                              : prev.filter(v => v !== option.value)
                          )
                        }}
                      />
                      <Label htmlFor={`field-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>导出格式</Label>
                <Select value={exportFormat} onValueChange={(v: 'csv' | 'xlsx') => setExportFormat(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx"><FileSpreadsheet className="inline-block mr-2 h-4 w-4" />Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv"><FileText className="inline-block mr-2 h-4 w-4" />CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExport} disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Download className="mr-2 h-4 w-4" />
                创建导出任务
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>导出任务历史</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportHistoryTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
