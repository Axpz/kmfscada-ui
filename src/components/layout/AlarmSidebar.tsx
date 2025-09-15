'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bell, AlertTriangle, History } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Role } from '@/types'

interface AlarmSidebarProps {
  className?: string
}

const alarmNavItems = [
  {
    href: '/alarms/history',
    label: '报警历史',
    icon: History,
    description: '查看和管理历史报警记录',
    requiredRole: ['super_admin', 'admin', 'user'] as Role[]
  },
  {
    href: '/alarms/rules',
    label: '报警规则',
    icon: AlertTriangle,
    description: '配置报警阈值和规则',
    requiredRole: ['super_admin', 'admin', 'user'] as Role[]
  }
]

export default function AlarmSidebar({ className }: AlarmSidebarProps) {
  const pathname = usePathname()
  const { hasRole } = useSupabaseAuth()

  // 过滤用户有权限访问的导航项
  const filteredNavItems = alarmNavItems.filter(item => {
    return hasRole(item.requiredRole)
  })

  return (
    <div className={cn("w-56 hidden md:flex md:flex-col bg-background", className)}>
      <nav className="flex-1 space-y-1 p-2">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </nav>
      
      {filteredNavItems.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">无可用的报警功能</p>
        </div>
      )}
    </div>
  )
}