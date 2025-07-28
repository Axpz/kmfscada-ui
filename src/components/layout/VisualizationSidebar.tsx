'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, BarChart3, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts'
import { Role } from '@/types'

interface VisualizationSidebarProps {
  className?: string
}

const visualizationNavItems = [
  {
    href: '/visualization/overview',
    label: '可视化概览',
    icon: Eye,
    description: '实时数据展示和图表概览',
    requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
  },
  {
    href: '/visualization/analysis',
    label: '统计分析',
    icon: TrendingUp,
    description: '历史数据分析和趋势统计',
    requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
  }
]

export default function VisualizationSidebar({ className }: VisualizationSidebarProps) {
  const pathname = usePathname()
  const { hasRole } = useAuth()

  // 过滤用户有权限访问的导航项
  const filteredNavItems = visualizationNavItems.filter(item => {
    return hasRole(item.requiredRole)
  })

  return (
    <div className={cn("w-64 hidden md:flex md:flex-col", className)}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-6 w-6" />
          <span>可视化中心</span>
        </div>
      </div>
      
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
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">无可用的可视化功能</p>
        </div>
      )}
    </div>
  )
}