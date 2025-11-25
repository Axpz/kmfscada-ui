'use client'

import React, { useState } from 'react'
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
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { DataPagination } from '@/components/ui/data-pagination'
import { usePagination } from '@/hooks/usePagination'

// 扩展 dayjs 以支持时区
dayjs.extend(utc)
dayjs.extend(timezone)
import {
  AlertCircle,
  Loader2,
  History,
  ChevronDown,
  ChevronUp,
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
  // 使用分页 hook
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    getPaginationInfo
  } = usePagination()

  const { data: exportRecords, isLoading, error } = useExportRecords()

  const { data: availableLines } = useAvailableProductionLines()
  const lineNames = availableLines?.items.map(line => line.name) || []

  // 计算分页数据
  const allRecords = exportRecords?.items || []
  const totalItems = allRecords.length
  const paginationInfo = getPaginationInfo(totalItems)
  
  // 获取当前页的数据
  const currentPageRecords = allRecords.slice(
    paginationInfo.startIndex,
    paginationInfo.startIndex + pageSize
  )

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
      <div className="gap-y-4 md:gap-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">导出历史</h2>
            <p className="text-sm text-muted-foreground">
              查看所有数据导出任务的历史记录和状态
            </p>
          </div>
        </div>

        {/* 桌面端表格 */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">生产线</TableHead>
                <TableHead className="min-w-[150px]">数据字段</TableHead>
                <TableHead className="min-w-[140px]">时间范围</TableHead>
                <TableHead className="hidden lg:table-cell">格式</TableHead>
                <TableHead className="hidden lg:table-cell">文件大小</TableHead>
                <TableHead className="min-w-[140px]">创建时间</TableHead>
                <TableHead className="min-w-[80px]">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageRecords.map((record: ExportRecord) => {
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
                    <TableCell className="text-sm">
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
                    <TableCell className="hidden lg:table-cell">
                      {record.format ? record.format : '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
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

        {/* 移动端卡片布局 */}
        <div className="md:hidden space-y-3">
          {currentPageRecords.map((record: ExportRecord) => {
            const dataFields = record.fields.split(',')
            const productionLines = record.line_names.split(',')
            return (
              <ExportRecordCard 
                key={record.id} 
                record={record} 
                productionLines={productionLines}
                dataFields={dataFields}
              />
            )
          })}
        </div>

        {/* 分页组件 */}
        {totalItems > 0 && (
          <div className="flex justify-center">
            <DataPagination
              currentPage={currentPage}
              totalPages={paginationInfo.totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* 空状态提示 */}
        {allRecords.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无导出历史记录</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// 移动端导出记录卡片组件
interface ExportRecordCardProps {
  record: ExportRecord
  productionLines: string[]
  dataFields: string[]
}

function ExportRecordCard({ record, productionLines, dataFields }: ExportRecordCardProps) {
  const [showAllLines, setShowAllLines] = useState(false)
  const [showAllFields, setShowAllFields] = useState(false)

  const shouldShowLinesToggle = productionLines.length > 2
  const shouldShowFieldsToggle = dataFields.length > 2

  return (
    <div className="p-4 rounded-lg border bg-card">
      {/* 卡片头部 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* 生产线信息 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span>生产线:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {shouldShowLinesToggle && !showAllLines ? (
                <div className="space-y-1">
                  <div>{productionLines.slice(0, 2).join(', ')}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground p-0"
                    onClick={() => setShowAllLines(true)}
                  >
                    +{productionLines.length - 2}个
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div>{productionLines.join(', ')}</div>
                  {shouldShowLinesToggle && showAllLines && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground p-0"
                      onClick={() => setShowAllLines(false)}
                    >
                      收起
                      <ChevronUp className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 数据字段信息 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">数据字段:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {shouldShowFieldsToggle && !showAllFields ? (
                <div className="space-y-1">
                  <div>{dataFields.slice(0, 2).join(', ')}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground p-0"
                    onClick={() => setShowAllFields(true)}
                  >
                    +{dataFields.length - 2}个
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div>{dataFields.join(', ')}</div>
                  {shouldShowFieldsToggle && showAllFields && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground p-0"
                      onClick={() => setShowAllFields(false)}
                    >
                      收起
                      <ChevronUp className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={record.status} />
      </div>
      
      {/* 时间范围信息 */}
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-sm">时间范围:</span>
        <span className="text-sm text-muted-foreground">
          {record.start_time && record.end_time ? (
            <>
              {dayjs.utc(record.start_time).local().format('YYYY-MM-DD')} 至{' '}
              {dayjs.utc(record.end_time).local().format('YYYY-MM-DD')}
            </>
          ) : (
            <span className="text-muted-foreground">无</span>
          )}
        </span>
      </div>

      <div className="mb-3 flex justify-between text-sm">
        <span>格式:</span>
        <span className='text-muted-foreground'>{record.format ? record.format : '-'}</span>
      </div>

      {/* 格式和文件大小 */}
      <div className="mb-3 flex justify-between text-sm">
        {record.size && (
          <>
            <span>大小:</span>
            <span className='text-muted-foreground'>{formatFileSize(record.size)}</span>
          </>
        )}
      </div>
      
      {/* 创建时间 */}
      <div className="mb-3 flex justify-between text-sm">
        <span>创建时间:</span>
        <span className='text-muted-foreground'>{dayjs.utc(record.updated_at).local().format('YYYY-MM-DD HH:mm:ss')}</span>
      </div>
    </div>
  )
}