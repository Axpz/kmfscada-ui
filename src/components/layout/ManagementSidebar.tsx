'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Users, Factory, Settings, Shield } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Role } from '@/types'

interface ManagementSidebarProps {
  className?: string
}

const managementNavItems = [
  // {
  //   href: '/management/system',
  //   label: '系统设置',
  //   icon: Settings,
  //   description: '系统配置和参数设置',
  //   requiredRole: ['superadmin'] as Role[]
  // },
  {
    href: '/management/users',
    label: '用户管理',
    icon: Users,
    description: '管理系统用户和权限',
    requiredRole: ['admin', 'super_admin'] as Role[]
  },
  {
    href: '/management/lines',
    label: '生产线管理',
    icon: Factory,
    description: '配置和管理生产线',
    requiredRole: ['user', 'admin', 'super_admin'] as Role[]
  },
  {
    href: '/management/security',
    label: '安全审计',
    icon: Shield,
    description: '查看系统安全日志',
    requiredRole: ['user', 'admin', 'super_admin'] as Role[]
  }
]

export default function ManagementSidebar({ className }: ManagementSidebarProps) {
  const pathname = usePathname()
  const { hasRole } = useSupabaseAuth()

  // 过滤用户有权限访问的导航项
  const filteredNavItems = managementNavItems.filter(item => {
    return hasRole(item.requiredRole)
  })

  return (
    <div className={cn("w-48 hidden md:flex md:flex-col", className)}>

      
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
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">无可用的管理功能</p>
        </div>
      )}
    </div>
  )
}