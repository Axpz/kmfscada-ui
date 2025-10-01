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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  Filter,
  ChevronDown,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
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
      filter.start_time = dateRange.from.toISOString()
    }
    if (dateRange?.to) {
      filter.end_time = dateRange.to.toISOString()
    }

    return filter
  }, [statusFilter, productionLineFilter, messageFilter, dateRange, currentPage, pageSize])

  // 使用新的hooks
  const { data: alarmData, isLoading, error, refetch: refetchAlarmRecords } = useAlarmRecordsList(filters)
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

  const handleAcknowledgeWithLoading = async (alarmId: number) => {
    acknowledgeAlarm(
      { 
        id: alarmId, 
        acknowledgeData: { acknowledged_by: 'current_user' }
      },
      {
        onSuccess: () => {
          refetchAlarmRecords()
        },
        onError: (err) => {
          toast.error(`操作失败: ${err.message}`)
        },
      }
    )
  }

  // 确认所有未确认的报警
  const handleAcknowledgeAll = () => {
    acknowledgeAlarmAll(
      { acknowledged_by: 'current_user' },
      {
        onSuccess: () => {
          refetchAlarmRecords()
        }
      }
    )
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
    <div className="space-y-4 md:space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">报警历史</h2>
          <p className="text-sm text-muted-foreground">
            查看和管理系统历史报警记录
          </p>
        </div>
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

      {/* 移动端折叠过滤器 */}
      <div className="md:hidden">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>过滤条件</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {Object.values({statusFilter, productionLineFilter, messageFilter, dateRange}).filter(Boolean).length}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <Select value={productionLineFilter || "all"} onValueChange={(value) => {
                setProductionLineFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="生产线" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部生产线</SelectItem>
                  {lineIds?.filter(line => line !== '*').map(line => (
                    <SelectItem key={line} value={line}>
                      {line}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(v) => {
                setStatusFilter(v as any)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="unacknowledged">未确认</SelectItem>
                  <SelectItem value="acknowledged">已确认</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索报警信息..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 pl-10"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-9 px-3"
                  title="清除过滤条件"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <DateRangePicker 
              value={dateRange} 
              onChange={(range: DateRange | undefined) => {
                setDateRange(range)
                setCurrentPage(1)
              }} 
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 桌面端表格 */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
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
                      <SelectTrigger className="h-8 w-28 !text-xs">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
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
                        className="h-8 pl-7 w-28 !text-xs"
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead>
                  <span className="whitespace-nowrap">报警值</span>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">报警时间</span>
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
                  <span className="whitespace-nowrap">确认人</span>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">状态</span>
                    <Select value={statusFilter} onValueChange={(v) => {
                      setStatusFilter(v as any)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="h-8 w-28 !text-xs">
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
                  <TableCell>
                    {alarm.line_id} 
                  </TableCell>
                  <TableCell>
                    {alarm.alarm_message}
                  </TableCell>
                  <TableCell>
                    {alarm.parameter_value.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {dayjs(alarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {alarm.acknowledged_by || '-'}
                  </TableCell>
                  <TableCell>
                    <AlarmConfirmationBadge
                      isConfirmed={alarm.is_acknowledged}
                      onConfirm={() => handleAcknowledgeWithLoading(alarm.id)}
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 移动端卡片布局 */}
      <div className="md:hidden space-y-3">
        {alarms.map((alarm: AlarmRecord) => (
          <div 
            key={alarm.id} 
            className={`p-4 rounded-lg border transition-colors ${
              !alarm.is_acknowledged ? 'bg-destructive/5 border-destructive/20' : 'bg-card'
            }`}
          >
            {/* 卡片头部 */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {alarm.line_id}
                </div>
              </div>
              <div className="flex-shrink-0">
                <AlarmConfirmationBadge
                  isConfirmed={alarm.is_acknowledged}
                  onConfirm={() => handleAcknowledgeWithLoading(alarm.id)}
                  size="sm"
                />
              </div>
            </div>

            {/* 关键信息 */}
            <div className="mb-3 text-sm">
              <div className="flex flex-col justify-between">
                <span className='text-left'>报警信息:</span>
                <span className="text-right text-muted-foreground break-all">{alarm.alarm_message}</span>
              </div>
            </div>
            
            {/* 关键信息 */}
            <div className="mb-3 text-sm">
              <div className="flex justify-between">
                <span>报警值:</span>
                <span className='text-muted-foreground'>{alarm.parameter_value.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-3 text-sm">
              <div className="flex justify-between">
                <span>发生时间:</span>
                <span className='text-muted-foreground'>{dayjs(alarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>

            {/* 状态信息 */}
            {/* <div className="flex items-center gap-1 mb-3 text-muted-foreground text-sm">
              <span>
                {!alarm.is_acknowledged ? "未确认" : "已确认"}
              </span>
            </div> */}

            {/* 确认信息 */}
            {alarm.is_acknowledged && (
              <div className="mb-3 text-sm">
                {alarm.acknowledged_by && (
                  <div className="flex justify-between">
                    <span>确认人员:</span>
                    <span className='text-muted-foreground'>{alarm.acknowledged_by}</span>
                  </div>
                )}
                {alarm.acknowledged_at && (
                  <div className="flex justify-between">
                    <span>确认时间:</span>
                    <span className='text-muted-foreground'>{dayjs(alarm.acknowledged_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 分页组件 */}
      {totalAlarms > 0 && (
        <div className="flex justify-center">
          <DataPagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            pageSize={pageSize}
            totalItems={totalAlarms}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* 空状态提示 */}
      {alarms.length === 0 && (
        <div className="text-center py-8 md:py-12 px-4 text-muted-foreground">
          <Bell className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
          <p className="text-base md:text-lg font-medium mb-2">暂无报警记录</p>
          <p className="text-sm">当前筛选条件下没有找到报警数据</p>
        </div>
      )}
    </div>
  )
}