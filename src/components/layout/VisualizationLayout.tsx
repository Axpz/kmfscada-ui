'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppLayout from './AppLayout'
import VisualizationSidebar from './VisualizationSidebar'
import MobileBottomTabs, { getTabsForPath } from './MobileBottomTabs'
import { Role } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VisualizationLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function VisualizationLayout({
  children,
  title = "可视化中心",
  description = "数据可视化与分析展示"
}: VisualizationLayoutProps) {
  const { hasRole } = useSupabaseAuth()
  const pathname = usePathname()

  // 检查用户是否有可视化功能权限
  if (!hasRole(['super_admin', 'admin', 'user'] as Role[])) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div>
              <h1 className="text-2xl font-bold text-destructive">访问被拒绝</h1>
              <p className="text-muted-foreground mt-2">
                您没有权限访问可视化中心功能。请联系系统管理员。
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex h-full bg-background">
        {/* Desktop Sidebar */}
        <VisualizationSidebar className="flex-shrink-0" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex-1 p-1 overflow-auto bg-background mb-16 md:mb-0">
            {children}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Tabs */}
      <MobileBottomTabs items={getTabsForPath(pathname)} />
    </AppLayout>
  )
}