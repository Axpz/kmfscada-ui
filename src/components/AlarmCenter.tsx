'use client'

import React, { useState, useMemo } from 'react'
import { useAlarmHistory, useAcknowledgeAlarm } from '@/hooks/useApi'
import { AlarmRecord } from '@/types'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import dayjs from 'dayjs'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Bell,
  Filter,
  X,
  Search,
} from 'lucide-react'

export default function AlarmCenter() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'acknowledged' | 'unacknowledged'>('all')
  const [productionLineFilter, setProductionLineFilter] = useState<string>('')
  const [messageFilter, setMessageFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { data: alarms, isLoading, error } = useAlarmHistory()
  const { mutate: acknowledgeAlarm } = useAcknowledgeAlarm()

  // 获取唯一的生产线列表
  const uniqueProductionLines = useMemo(() => {
    if (!alarms) return []
    const lines = [...new Set(alarms.map(alarm => alarm.production_line_id))]
    return lines.sort()
  }, [alarms])

  const filteredAlarms = useMemo(() => {
    if (!alarms) return []
    return alarms.filter(alarm => {
      // 状态过滤
      if (statusFilter !== 'all') {
        const isAcknowledged = statusFilter === 'acknowledged'
        if (alarm.acknowledged !== isAcknowledged) return false
      }

      // 生产线过滤
      if (productionLineFilter && alarm.production_line_id !== productionLineFilter) {
        return false
      }

      // 报警信息过滤
      if (messageFilter && !alarm.message.toLowerCase().includes(messageFilter.toLowerCase())) {
        return false
      }

      // 日期范围过滤
      if (dateRange?.from || dateRange?.to) {
        const alarmDate = dayjs(alarm.timestamp)
        if (dateRange.from && alarmDate.isBefore(dayjs(dateRange.from), 'day')) {
          return false
        }
        if (dateRange.to && alarmDate.isAfter(dayjs(dateRange.to), 'day')) {
          return false
        }
      }

      return true
    })
  }, [alarms, statusFilter, productionLineFilter, messageFilter, dateRange])

  // 清除所有过滤器
  const clearAllFilters = () => {
    setStatusFilter('all')
    setProductionLineFilter('')
    setMessageFilter('')
    setDateRange(undefined)
  }

  // 检查是否有活跃的过滤器
  const hasActiveFilters = statusFilter !== 'all' || productionLineFilter || messageFilter || dateRange

  const handleAcknowledge = (alarmId: string) => {
    acknowledgeAlarm(alarmId, {
      onSuccess: () => toast.success(`报警 #${alarmId} 已确认。`),
      onError: (err) => toast.error(`操作失败: ${err.message}`),
    })
  }

  const getStatusBadge = (acknowledged: boolean) => {
    return (
      <Badge variant={acknowledged ? 'default' : 'destructive'}>
        {acknowledged ? '已确认' : '未确认'}
      </Badge>
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
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">报警历史</h2>
          <p className="text-sm text-muted-foreground">
            查看和管理系统历史报警记录，确认未处理的报警
          </p>
        </div>
        {/* <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="unacknowledged">未确认</SelectItem>
                <SelectItem value="acknowledged">已确认</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            共 {filteredAlarms.length} 条记录
          </p>
        </div> */}
      </div>

      {/* 报警历史表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">生产线</span>
                  <Select value={productionLineFilter || "all"} onValueChange={(value) => setProductionLineFilter(value === "all" ? "" : value)}>
                    <SelectTrigger className="h-8 w-32 !text-xs">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部生产线</SelectItem>
                      {uniqueProductionLines.map(line => (
                        <SelectItem key={line} value={line}>
                          生产线 #{line}
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
                      value={messageFilter}
                      onChange={(e) => setMessageFilter(e.target.value)}
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
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">状态</span>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="h-8 w-32 !text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="unacknowledged">未确认</SelectItem>
                      <SelectItem value="acknowledged">已确认</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">操作</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2"
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
            {filteredAlarms.map((alarm: AlarmRecord) => (
              <TableRow key={alarm.id} className={!alarm.acknowledged ? 'bg-destructive/5' : ''}>
                <TableCell>生产线 #{alarm.production_line_id}</TableCell>
                <TableCell>{alarm.message}</TableCell>
                <TableCell className="hidden sm:table-cell">{alarm.current_value.toFixed(3)}</TableCell>
                <TableCell className="hidden md:table-cell">{dayjs(alarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{getStatusBadge(alarm.acknowledged)}</TableCell>
                <TableCell>
                  {!alarm.acknowledged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alarm.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      确认
                    </Button>
                  ) : (
                    <span>已处理</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 空状态提示 */}
      {filteredAlarms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无报警记录</p>
        </div>
      )}
    </div>
  )
}