'use client'

import React from 'react'
import { useExportHistory } from '@/hooks/useApi'
// import { ExportTask } from '@/types' // 移除未使用的导入
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展 dayjs 以支持时区
dayjs.extend(utc)
dayjs.extend(timezone)
import {
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
  ChevronDown,
} from 'lucide-react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { ExportRecord, useExportRecords } from '@/hooks/useExportRecords'

// 格式化文件大小的工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function ExportHistory() {
  const { data: exportRecords, isLoading, error } = useExportRecords()

  const { data: availableLines } = useAvailableProductionLines()
  const lineNames = availableLines?.items.map(line => line.name) || []

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
                <TableHead className="hidden sm:table-cell">文件大小</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportRecords?.items?.map((record: ExportRecord) => {
                const dataFields = record.fields.split(',')
                const productionLines = record.line_names.split(',')
                return (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm">
                      {productionLines.length <= 3 ? (
                        <span>{productionLines.join(', ')}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{productionLines.slice(0, 3).join(', ')}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                +{productionLines.length - 3}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                  {productionLines.map((line: string, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs"
                                    >
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                                      <span className="truncate">{line}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {dataFields.length <= 2 ? (
                        <span>{dataFields.join(', ')}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{dataFields.slice(0, 2).join(', ')}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                +{dataFields.length - 2}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                  {dataFields.map((field: string, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs"
                                    >
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                                      <span className="truncate">{field}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.start_time && record.end_time ? (
                        <>
                          {dayjs.utc(record.start_time).local().format('YYYY-MM-DD')} 至{' '}
                          {dayjs.utc(record.end_time).local().format('YYYY-MM-DD')}
                        </>
                      ) : (
                        <span className="text-muted-foreground">配置缺失</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {record.format ? record.format.toUpperCase() : '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {record.size ? formatFileSize(record.size) : '-'}
                    </TableCell>
                    <TableCell>
                      {dayjs.utc(record.updated_at).local().format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell><StatusBadge status={record.status} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* 空状态提示 */}
        {exportRecords?.items?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无导出历史记录</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}