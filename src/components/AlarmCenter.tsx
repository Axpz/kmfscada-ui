'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { AlertTriangle, AlertCircle, Info, Search, Filter, Bell, RefreshCw } from 'lucide-react'

interface AlarmItem {
  id: string
  level: 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  source: string
  acknowledged: boolean
}

const mockAlarms: AlarmItem[] = [
  {
    id: 'A001',
    level: 'error',
    title: '严重错误',
    message: '生产线 3 - 主设备故障，紧急停机。',
    timestamp: '2025-01-23 21:00:15',
    source: '生产线 3',
    acknowledged: false
  },
  {
    id: 'A002',
    level: 'warning',
    title: '警告',
    message: '生产线 1 - 良品率持续低于目标值。',
    timestamp: '2025-01-23 20:45:30',
    source: '生产线 1',
    acknowledged: false
  },
  {
    id: 'A003',
    level: 'info',
    title: '信息',
    message: '系统维护通知：预计 23:00-23:30 进行。',
    timestamp: '2025-01-23 20:30:00',
    source: '系统',
    acknowledged: true
  },
  {
    id: 'A004',
    level: 'error',
    title: '错误',
    message: '数据库连接中断，请检查网络。',
    timestamp: '2025-01-23 19:10:00',
    source: '数据库',
    acknowledged: false
  },
  {
    id: 'A005',
    level: 'warning',
    title: '警告',
    message: '生产线 5 - 原材料库存不足。',
    timestamp: '2025-01-23 18:05:00',
    source: '生产线 5',
    acknowledged: true
  },
  {
    id: 'A006',
    level: 'info',
    title: '信息',
    message: '定期备份任务已完成。',
    timestamp: '2025-01-23 17:30:00',
    source: '系统',
    acknowledged: true
  }
]

const getAlarmIcon = (level: string) => {
  switch (level) {
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return <Info className="h-5 w-5 text-gray-500" />
  }
}

const getAlarmBadgeVariant = (level: string) => {
  switch (level) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'info':
      return 'default'
    default:
      return 'outline'
  }
}

const getAlarmBgColor = (level: string, acknowledged: boolean) => {
  if (acknowledged) return 'bg-muted/30'
  
  switch (level) {
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    default:
      return 'bg-card'
  }
}

export default function AlarmCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [alarms, setAlarms] = useState<AlarmItem[]>(mockAlarms)

  const filteredAlarms = alarms.filter(alarm => {
    const matchesSearch = alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alarm.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || alarm.level === levelFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'acknowledged' && alarm.acknowledged) ||
                         (statusFilter === 'unacknowledged' && !alarm.acknowledged)
    return matchesSearch && matchesLevel && matchesStatus
  })

  const handleAcknowledge = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ))
  }

  const unacknowledgedCount = alarms.filter(a => !a.acknowledged).length
  const errorCount = filteredAlarms.filter(a => a.level === 'error').length
  const warningCount = filteredAlarms.filter(a => a.level === 'warning').length
  const infoCount = filteredAlarms.filter(a => a.level === 'info').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8" />
            告警中心
          </h1>
          <p className="text-muted-foreground">实时监控系统告警信息</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">未确认告警</p>
                <p className="text-2xl font-bold text-red-600">{unacknowledgedCount}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">错误</p>
                <p className="text-2xl font-bold text-red-500">{errorCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">警告</p>
                <p className="text-2xl font-bold text-yellow-500">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">信息</p>
                <p className="text-2xl font-bold text-blue-500">{infoCount}</p>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索告警..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有级别</SelectItem>
                <SelectItem value="error">错误</SelectItem>
                <SelectItem value="warning">警告</SelectItem>
                <SelectItem value="info">信息</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="unacknowledged">未确认</SelectItem>
                <SelectItem value="acknowledged">已确认</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alarm List */}
      <Card>
        <CardHeader>
          <CardTitle>告警列表</CardTitle>
          <p className="text-sm text-muted-foreground">
            共 {filteredAlarms.length} 条告警信息
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredAlarms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>没有找到匹配的告警信息</p>
              </div>
            ) : (
              filteredAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${getAlarmBgColor(alarm.level, alarm.acknowledged)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getAlarmIcon(alarm.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getAlarmBadgeVariant(alarm.level) as any}>
                          {alarm.title}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          来源: {alarm.source}
                        </span>
                        {alarm.acknowledged && (
                          <Badge variant="outline" className="text-xs">
                            已确认
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {alarm.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm ${alarm.acknowledged ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {alarm.message}
                    </p>
                    {!alarm.acknowledged && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAcknowledge(alarm.id)}
                        >
                          确认告警
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}