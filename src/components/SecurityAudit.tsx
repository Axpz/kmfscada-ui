'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import { DateRange } from 'react-day-picker'
import { DataPagination } from '@/components/ui/data-pagination'
import { usePagination } from '@/hooks/usePagination'
import {
  Shield,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Filter,
  Loader2
} from 'lucide-react'
import { addDays, format } from 'date-fns'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import type { AuditLogFilter } from '@/types'

export default function SecurityAudit() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')

  // 使用分页 hook
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    getPaginationInfo
  } = usePagination()

  // 构建过滤条件
  const buildFilters = (): AuditLogFilter => {
    const filters: AuditLogFilter = {
      page: currentPage,
      size: pageSize
    }

    if (searchTerm) {
      // 如果搜索词包含@，认为是邮箱搜索
      if (searchTerm.includes('@')) {
        filters.email = searchTerm
      } else {
        // 否则搜索操作类型
        filters.action = searchTerm
      }
    }

    if (actionFilter) {
      filters.action = actionFilter
    }

    if (dateRange?.from) {
      filters.start_time = dateRange.from.toISOString()
    }

    if (dateRange?.to) {
      filters.end_time = dateRange.to.toISOString()
    }

    return filters
  }

  // 构建过滤条件
  const filters = buildFilters()
  
  // 使用 React Query hook 获取数据
  const { data, isLoading, error, refetch } = useAuditLogs(filters)
  
  const logs = data?.items || []
  const total = data?.total || 0
  const loading = isLoading
  const paginationInfo = getPaginationInfo(total)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-destructive/10 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载安全日志失败</h2>
        <p className="mt-2 text-muted-foreground">{error instanceof Error ? error.message : '未知错误'}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">安全审计</h2>
            <p className="text-sm text-muted-foreground">
              查看系统安全日志和用户活动记录
            </p>
          </div>
        </div>

        {/* 桌面端表格 */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">时间</TableHead>
                <TableHead className="min-w-[120px]">用户</TableHead>
                <TableHead className="min-w-[100px]">操作</TableHead>
                <TableHead className="hidden lg:table-cell">IP地址</TableHead>
                <TableHead className="min-w-[200px]">详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.email || '未知用户'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.action}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate" title={log.detail || ''}>
                    {log.detail || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 移动端卡片布局 */}
        <div className="md:hidden space-y-3">
          {logs.map((log) => (
            <SecurityLogCard key={log.id} log={log} />
          ))}
        </div>

        {/* 分页组件 */}
        {total > 0 && (
          <div className="flex justify-center">
            <DataPagination
              currentPage={currentPage}
              totalPages={paginationInfo.totalPages}
              pageSize={pageSize}
              totalItems={total}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* 空状态提示 */}
        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无安全日志记录</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// 移动端安全日志卡片组件
interface SecurityLogCardProps {
  log: any // TODO: 添加正确的类型定义
}

function SecurityLogCard({ log }: SecurityLogCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      {/* 卡片头部 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* 用户信息 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{log.email || '未知用户'}</span>
            </div>
          </div>

          {/* 操作信息 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{log.action}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 详情信息 */}
      <div className="mb-3 flex flex-col gap-1 text-sm">
        <span className="self-start">操作详情:</span>
        <span className="self-end text-muted-foreground break-all">
          {log.detail || '-'}
        </span>
      </div>

      {/* IP地址信息 */}
      <div className="mb-3 flex justify-between text-sm">
        <span>用户IP地址:</span>
        <span className="text-muted-foreground">{log.ip_address || '-'}</span>
      </div>
      
      {/* 时间信息 */}
      <div className="mb-3 flex justify-between text-sm">
        <span className="flex items-center gap-2">
          <span>用户操作时间:</span>
        </span>
        <span className="text-muted-foreground">
          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
        </span>
      </div>

      
      
      
    </div>
  )
}