'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

interface SidebarItem {
  id: string
  label: string
  icon?: React.ElementType
  badge?: string | number
  active?: boolean
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  onItemClick?: (itemId: string) => void
  className?: string
}

export function Sidebar({ sections, onItemClick, className }: SidebarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-9",
                    item.active && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onItemClick?.(item.id)}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 预定义的侧边栏配置
export const dashboardSidebarSections: SidebarSection[] = [
  {
    title: "生产线监控",
    items: [
      { id: 'line1', label: '生产线 1', active: true, badge: '运行中' },
      { id: 'line2', label: '生产线 2', badge: '运行中' },
      { id: 'line3', label: '生产线 3', badge: '维护中' },
      { id: 'line4', label: '生产线 4', badge: '运行中' },
    ]
  },
  {
    title: "数据视图",
    items: [
      { id: 'overview', label: '总览' },
      { id: 'realtime', label: '实时数据' },
      { id: 'history', label: '历史数据' },
      { id: 'reports', label: '报表' },
    ]
  }
]

export const alarmSidebarSections: SidebarSection[] = [
  {
    title: "告警级别",
    items: [
      { id: 'critical', label: '严重', badge: 3 },
      { id: 'warning', label: '警告', badge: 12 },
      { id: 'info', label: '信息', badge: 25 },
    ]
  },
  {
    title: "告警来源",
    items: [
      { id: 'line1', label: '生产线 1', badge: 2 },
      { id: 'line2', label: '生产线 2', badge: 1 },
      { id: 'system', label: '系统', badge: 5 },
      { id: 'network', label: '网络', badge: 1 },
    ]
  }
]

export const userSidebarSections: SidebarSection[] = [
  {
    title: "用户管理",
    items: [
      { id: 'users', label: '用户列表', active: true },
      { id: 'roles', label: '角色管理' },
      { id: 'permissions', label: '权限设置' },
    ]
  },
  {
    title: "系统设置",
    items: [
      { id: 'general', label: '常规设置' },
      { id: 'security', label: '安全设置' },
      { id: 'backup', label: '备份恢复' },
      { id: 'logs', label: '系统日志' },
    ]
  }
]

