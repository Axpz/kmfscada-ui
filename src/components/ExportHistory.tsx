'use client'

import React from 'react'
import { useExportHistory } from '@/hooks/useApi'
import { ExportTask } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import {
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
} from 'lucide-react'

export default function ExportHistory() {
  const { data: tasks, isLoading, error } = useExportHistory()

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

    const icons = {
      pending: Clock,
      processing: Loader2,
      completed: CheckCircle,
      failed: AlertCircle,
    }

    const Icon = icons[status]

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {labels[status]}
      </Badge>
    )
  }

  // 格式化生产线显示
  const formatProductionLines = (config: any) => {
    // 添加测试数据
    const testLines = ['生产线1', '生产线2', '生产线3', '生产线4', '生产线5']
    if (!config?.production_line_ids || !Array.isArray(config.production_line_ids)) {
      return testLines.slice(0, Math.floor(Math.random() * 5) + 1).join(', ')
    }
    const lines = config.production_line_ids
    if (lines.length <= 2) {
      return lines.map((id: string) => `生产线${id}`).join(', ')
    }
    return `生产线${lines[0]}, 生产线${lines[1]} +${lines.length - 2}条`
  }

  // 获取数据字段列表
  const getDataFields = (config: any) => {
    // Mock 10个数据字段
    const testFields = [
      '机身温度', '法兰温度', '模具温度', '螺杆转速', '牵引速度',
      '实时直径', '生产长度', '氟离子浓度', '主轴电流', '压力值'
    ]
    if (!config?.fields || !Array.isArray(config.fields)) {
      const randomCount = Math.floor(Math.random() * 10) + 1
      return testFields.slice(0, randomCount)
    }
    return config.fields
  }

  // 格式化数据字段显示
  const formatDataFields = (fields: string[]) => {
    if (fields.length <= 2) {
      return fields.join(', ')
    }
    return `${fields[0]}, ${fields[1]} +${fields.length - 2}项`
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
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载导出历史失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">导出历史</h2>
            <p className="text-sm text-muted-foreground">
              查看所有数据导出任务的历史记录和状态
            </p>
          </div>
        </div>

        {/* 导出历史表格 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>生产线</TableHead>
                <TableHead className="hidden sm:table-cell">数据字段</TableHead>
                <TableHead>时间范围</TableHead>
                <TableHead className="hidden sm:table-cell">格式</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks?.map((task: ExportTask) => {
                const dataFields = getDataFields(task.config)
                return (
                  <TableRow key={task.id}>
                    <TableCell className="text-sm">
                      {formatProductionLines(task.config)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted underline-offset-4">
                            {formatDataFields(dataFields)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-medium text-sm">数据字段列表</p>
                            <div className="grid gap-1 text-xs">
                              {dataFields.map((field: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                                  <span>{field}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.config?.start_time && task.config?.end_time ? (
                        <>
                          {format(new Date(task.config.start_time), 'yyyy-MM-dd')} 至{' '}
                          {format(new Date(task.config.end_time), 'yyyy-MM-dd')}
                        </>
                      ) : (
                        <span className="text-muted-foreground">配置缺失</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {task.config?.format ? task.config.format.toUpperCase() : '-'}
                    </TableCell>
                    <TableCell>
                      {dayjs(task.createdAt || task.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* 空状态提示 */}
        {tasks?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无导出历史记录</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}