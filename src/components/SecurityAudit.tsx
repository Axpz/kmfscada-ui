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
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
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

  // 构建过滤条件
  const buildFilters = (): AuditLogFilter => {
    const filters: AuditLogFilter = {
      page: 1,
      size: 100
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

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">安全日志记录</h2>
          <p className="text-sm text-muted-foreground">
            查看系统安全日志和用户活动记录
          </p>
        </div>
        {/* <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          导出日志
        </Button> */}
      </div>

      {/* 安全日志表格 - 应用增强样式 */}
      <div className="rounded-md border table-enhanced">
        <Table className="table-enhanced">
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-500">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>加载失败: {error instanceof Error ? error.message : '未知错误'}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>没有找到匹配的安全日志</p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.email || '未知用户'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.action}
                    </div>
                  </TableCell>
                  <TableCell>{log.ip_address || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.detail || ''}>
                    {log.detail || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 显示总数信息 */}
      {!loading && !error && logs.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          共 {total} 条记录，显示 {logs.length} 条
        </div>
      )}
    </div>
  )
}