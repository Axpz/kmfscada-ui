'use client'

import React, { useState } from 'react'
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
  Filter
} from 'lucide-react'
import { addDays } from 'date-fns'

// Mock 安全日志数据
const mockSecurityLogs = [
  {
    id: '1',
    timestamp: '2025-01-27 14:30:25',
    user: 'admin',
    action: '用户登录',
    ip: '192.168.1.100',
    status: 'success',
    details: '成功登录系统'
  },
  {
    id: '2',
    timestamp: '2025-01-27 14:25:12',
    user: 'operator1',
    action: '密码修改',
    ip: '192.168.1.105',
    status: 'success',
    details: '用户修改密码'
  },
  {
    id: '3',
    timestamp: '2025-01-27 14:20:08',
    user: 'unknown',
    action: '登录失败',
    ip: '192.168.1.200',
    status: 'failed',
    details: '密码错误，连续失败3次'
  },
  {
    id: '4',
    timestamp: '2025-01-27 14:15:33',
    user: 'manager',
    action: '权限变更',
    ip: '192.168.1.102',
    status: 'success',
    details: '修改用户 operator2 权限'
  },
  {
    id: '5',
    timestamp: '2025-01-27 14:10:45',
    user: 'admin',
    action: '系统配置',
    ip: '192.168.1.100',
    status: 'success',
    details: '修改系统安全设置'
  }
]

export default function SecurityAudit() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            成功
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            失败
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            警告
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredLogs = mockSecurityLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
              {/* <TableHead>状态</TableHead> */}
              <TableHead>详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {log.timestamp}
                  </div>
                </TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.ip}</TableCell>
                {/* <TableCell>{getStatusBadge(log.status)}</TableCell> */}
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>没有找到匹配的安全日志</p>
        </div>
      )}
    </div>
  )
}