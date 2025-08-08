'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { Eye, BarChart3, TrendingUp, Camera, Cpu, AlertTriangle, Package, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts'
import { Role } from '@/types'

interface VisualizationSidebarProps {
  className?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requiredRole: Role[]
  children?: NavItem[]
}

const visualizationNavItems: NavItem[] = [
  {
    href: '/visualization',
    label: '生成线概览',
    icon: Eye,
    description: '生产线数据概览',
    requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
  },
  {
    href: '/visualization/analysis',
    label: '统计分析',
    icon: TrendingUp,
    description: '历史数据分析和趋势统计',
    requiredRole: ['superadmin', 'admin', 'operator'] as Role[],
    children: [
      {
        href: '/visualization/analysis',
        label: '生产数据分析',
        icon: TrendingUp,
        description: '历史数据分析和趋势统计',
        requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
      },
      {
        href: '/visualization/analysis/equipment-utilization',
        label: '设备利用率分析',
        icon: Cpu,
        description: '设备运行效率和利用率统计分析',
        requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
      },
      // {
      //   href: '/visualization/analysis/energy-consumption',
      //   label: '能耗分析',
      //   icon: AlertTriangle,
      //   description: '能耗统计分析',
      //   requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
      // },
      // {
      //   href: '/visualization/analysis/equipment-failure',
      //   label: '设备故障率分析',
      //   icon: AlertTriangle,
      //   description: '设备故障频率和维护统计分析',
      //   requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
      // },
      // {
      //   href: '/visualization/analysis/material-utilization',
      //   label: '原材料利用率分析',
      //   icon: Package,
      //   description: '原材料消耗和利用效率分析',
      //   requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
      // }
    ]
  },
  {
    href: '/visualization/cameras',
    label: '摄像头监控',
    icon: Camera,
    description: '实时摄像头数据流监控和分析',
    requiredRole: ['superadmin', 'admin', 'operator'] as Role[]
  }
]

export default function VisualizationSidebar({ className }: VisualizationSidebarProps) {
  const pathname = usePathname()
  const { hasRole } = useAuth()

  // 简单的展开状态管理
  const getDefaultOpenState = () => {
    // 如果当前路径包含 analysis，则展开统计分析菜单
    return pathname.startsWith('/visualization/analysis') ? ['/visualization/analysis'] : []
  }

  const [openItems, setOpenItems] = useState<string[]>(getDefaultOpenState)

  // 过滤权限
  const filteredNavItems = visualizationNavItems.filter(item => hasRole(item.requiredRole))

  // 切换展开状态
  const toggleItem = (href: string) => {
    setOpenItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  // 渲染导航项
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openItems.includes(item.href)
    const Icon = item.icon

    if (hasChildren) {
      // 过滤子项权限
      const filteredChildren = item.children?.filter(child => hasRole(child.requiredRole)) || []
      
      if (filteredChildren.length === 0) {
        return null
      }

      return (
        <Collapsible key={item.href} open={isOpen} onOpenChange={() => toggleItem(item.href)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="ml-6 space-y-1">
              {filteredChildren.map(child => {
                const childIsActive = pathname === child.href
                const ChildIcon = child.icon
                
                return (
                  <Button
                    key={child.href}
                    asChild
                    variant={childIsActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Link href={child.href}>
                      <ChildIcon className="mr-2 h-4 w-4" />
                      {child.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        key={item.href}
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        <Link href={item.href} >
          <Icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    )
  }

  return (
    <div className={cn("w-56 hidden md:flex md:flex-col", className)}>
      <nav className="flex-1 space-y-1 p-2">
        <div className="space-y-1">
          {filteredNavItems.map(item => renderNavItem(item))}
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