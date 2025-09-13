'use client'

import React, { useState, useMemo } from 'react'
import { useAlarmRecordsList, useAcknowledgeAlarmRecord, useAcknowledgeAlarmAll } from '@/hooks/useAlarmRecords'
import { AlarmRecord, AlarmRecordFilter } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlarmConfirmationBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'
import { usePagination } from '@/hooks/usePagination'

import dayjs from 'dayjs'
import {
  Loader2,
  AlertCircle,
  Bell,
  X,
  Search,
  CheckCircle,
} from 'lucide-react'
import { useAvailableProductionLines } from '@/hooks/useProductionLines'
import { addDays } from 'date-fns'

export default function AlarmCenter() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'acknowledged' | 'unacknowledged'>('all')
  const [productionLineFilter, setProductionLineFilter] = useState<string>('')
  const [messageFilter, setMessageFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  
  // 使用分页 hook
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    getPaginationInfo
  } = usePagination()

  const { data: activeLineIds } = useAvailableProductionLines()
  const lineIds = ['*', ...activeLineIds?.items?.map(line => line.name) || []]

  // 处理搜索输入
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setMessageFilter(searchQuery)
      setCurrentPage(1)
    }
  }

  // 构建查询过滤器
  const filters: AlarmRecordFilter = useMemo(() => {
    const filter: AlarmRecordFilter = {
      page: currentPage,
      size: pageSize,
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filter.is_acknowledged = statusFilter === 'acknowledged'
    }

    // 生产线过滤
    if (productionLineFilter) {
      filter.line_id = productionLineFilter
    }

    // 报警信息过滤
    if (messageFilter) {
      filter.alarm_message = messageFilter
    }

    // 日期范围过滤
    if (dateRange?.from) {
      filter.start_time = dayjs(dateRange.from).format('YYYY-MM-DD HH:mm:ss')
    }
    if (dateRange?.to) {
      filter.end_time = dayjs(dateRange.to).format('YYYY-MM-DD HH:mm:ss')
    }

    return filter
  }, [statusFilter, productionLineFilter, messageFilter, dateRange, currentPage, pageSize])

  // 使用新的hooks
  const { data: alarmData, isLoading, error } = useAlarmRecordsList(filters)
  const { mutate: acknowledgeAlarm, isPending: isAcknowledging } = useAcknowledgeAlarmRecord()
  const { mutate: acknowledgeAlarmAll, isPending: isAcknowledgingAll } = useAcknowledgeAlarmAll()

  // 获取报警记录和总数
  const alarms = alarmData?.items || []
  const totalAlarms = alarmData?.total || 0
  const paginationInfo = getPaginationInfo(totalAlarms)

  // 清除所有过滤器
  const clearAllFilters = () => {
    setStatusFilter('all')
    setProductionLineFilter('')
    setMessageFilter('')
    setSearchQuery('')
    setDateRange(undefined)
    setCurrentPage(1)
  }

  // 检查是否有活跃的过滤器
  const hasActiveFilters = statusFilter !== 'all' || productionLineFilter || messageFilter || dateRange



  // 添加加载状态管理
  // const [acknowledgingAlarms, setAcknowledgingAlarms] = useState<Set<number>>(new Set())

  const handleAcknowledgeWithLoading = async (alarmId: number) => {
    // setAcknowledgingAlarms(prev => new Set(prev).add(alarmId))

    acknowledgeAlarm(
      { 
        id: alarmId, 
        acknowledgeData: { acknowledged_by: 'current_user' }
      },
      {
        onSuccess: () => {
          toast.success(`报警确认成功`)
        },
        onError: (err) => {
          toast.error(`操作失败: ${err.message}`)
        },
      }
    )
  }

  // 确认所有未确认的报警
  const handleAcknowledgeAll = () => {
    acknowledgeAlarmAll({
      acknowledged_by: 'current_user' // 这里应该从用户上下文获取
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
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载报警历史失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">报警历史</h2>
          <p className="text-sm text-muted-foreground">
            查看和管理系统历史报警记录，确认未处理的报警
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleAcknowledgeAll}
            disabled={isAcknowledgingAll}
          >
            {isAcknowledgingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            全部确认
          </Button>
        </div>
      </div>

      {/* 报警历史表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">生产线</span>
                  <Select value={productionLineFilter || "all"} onValueChange={(value) => {
                    setProductionLineFilter(value === "all" ? "" : value)
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="h-8 w-32 !text-xs">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {lineIds?.filter(line => line !== '*').map(line => (
                        <SelectItem key={line} value={line}>
                          {line}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">报警信息</span>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="搜索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="h-8 pl-7 w-32 !text-xs"
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <span className="whitespace-nowrap">当前值</span>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">发生时间</span>
                  <div className="flex-1 min-w-0">
                    <DateRangePicker 
                      value={dateRange} 
                      onChange={(range: DateRange | undefined) => {
                        setDateRange(range)
                        setCurrentPage(1)
                      }} 
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">确认状态</span>
                  <Select value={statusFilter} onValueChange={(v) => {
                    setStatusFilter(v as any)
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="h-8 w-32 !text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="unacknowledged">未确认</SelectItem>
                      <SelectItem value="acknowledged">已确认</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 ml-2"
                      title="清除所有过滤条件"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms.map((alarm: AlarmRecord) => (
              <TableRow key={alarm.id} className={!alarm.is_acknowledged ? 'bg-destructive/5' : ''}>
                <TableCell>{alarm.line_id}</TableCell>
                <TableCell>{alarm.alarm_message}</TableCell>
                <TableCell className="hidden sm:table-cell">{alarm.parameter_value.toFixed(3)}</TableCell>
                <TableCell className="hidden md:table-cell">{dayjs(alarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>
                  <AlarmConfirmationBadge
                    isConfirmed={alarm.is_acknowledged}
                    // loading={acknowledgingAlarms.has(alarm.id)}
                    onConfirm={() => handleAcknowledgeWithLoading(alarm.id)}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页组件 */}
      {totalAlarms > 0 && (
        <DataPagination
          currentPage={currentPage}
          totalPages={paginationInfo.totalPages}
          pageSize={pageSize}
          totalItems={totalAlarms}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* 空状态提示 */}
      {alarms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无报警记录</p>
        </div>
      )}
    </div>
  )
}