'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, TrendingUp, Cpu, History, AlertTriangle, Download, Users, Factory, Shield, Cctv } from 'lucide-react'
import { Role } from '@/types'

interface TabItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface MobileBottomTabsProps {
  items: TabItem[]
  className?: string
}

export default function MobileBottomTabs({ items, className }: MobileBottomTabsProps) {
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border md:hidden",
      className
    )}>
      <div className="flex">
        {items.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "flex-1 h-16 rounded-none flex-col gap-1 text-xs",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Link href={item.href}>
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className={cn("truncate", isActive && "text-primary")}>
                  {item.label}
                </span>
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// 预定义的可视化中心标签
export const visualizationTabs: TabItem[] = [
  { href: '/visualization', label: '数据概览', icon: Eye },
  { href: '/visualization/analysis', label: '统计分析', icon: TrendingUp },
  { href: '/visualization/cameras', label: '监控', icon: Cctv },
]

// 统计分析子页面标签
export const analysisSubTabs: TabItem[] = [
  { href: '/visualization/analysis', label: '生产线数据', icon: TrendingUp },
  { href: '/visualization/analysis/equipment-utilization', label: '设备利用率', icon: Cpu },
]

// 报警中心标签
export const alarmTabs: TabItem[] = [
  { href: '/alarms/history', label: '报警历史', icon: History },
  { href: '/alarms/rules', label: '报警规则', icon: AlertTriangle },
]

// 数据导出标签
export const exportTabs: TabItem[] = [
  { href: '/export', label: '数据导出', icon: Download },
  { href: '/export/history', label: '导出历史', icon: History },
]

// 管理中心标签
export const managementTabs: TabItem[] = [
  { href: '/management/users', label: '用户管理', icon: Users },
  { href: '/management/lines', label: '生产线', icon: Factory },
  { href: '/management/security', label: '安全审计', icon: Shield },
]

export const userRoleManagementTabs: TabItem[] = [
  { href: '/management/lines', label: '生产线', icon: Factory },
]

// 获取当前页面应该显示的标签
export const getTabsForPath = (pathname: string, hasRole?: (role: Role[]) => boolean): TabItem[] => {
  if (pathname.startsWith('/visualization/analysis')) {
    return analysisSubTabs
  }
  if (pathname.startsWith('/visualization')) {
    return visualizationTabs
  }
  if (pathname.startsWith('/alarms')) {
    return alarmTabs
  }
  if (pathname.startsWith('/export')) {
    return exportTabs
  }
  if (pathname.startsWith('/management')) {
    if (hasRole && hasRole(['user'])) {
      return userRoleManagementTabs
    }
    return managementTabs
  }
  return []
}
