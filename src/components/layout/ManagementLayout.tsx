'use client'

import React from 'react'
import AppLayout from './AppLayout'
import ManagementSidebar from './ManagementSidebar'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import MobileBottomTabs, { getTabsForPath } from './MobileBottomTabs'
import { usePathname } from 'next/navigation'

interface ManagementLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function ManagementLayout({ 
  children, 
  title = "系统管理",
  description = "管理系统配置和用户权限"
}: ManagementLayoutProps) {
  const { hasRole } = useSupabaseAuth()
  const pathname = usePathname()
  
  // 检查用户是否有管理权限
  if (!hasRole(['user', 'admin', 'super_admin'])) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div>
              <h1 className="text-2xl font-bold text-destructive">访问被拒绝</h1>
              <p className="text-muted-foreground mt-2">
                您没有权限访问系统管理功能。请联系系统管理员。
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
        {/* 管理功能侧边栏 */}
        <ManagementSidebar className="flex-shrink-0" />
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* 内容主体 - 移动端底部留出空间给底部导航 */}
          <div className="flex-1 p-1 overflow-auto bg-background pb-20 md:pb-1">
            {children}
          </div>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <MobileBottomTabs items={getTabsForPath(pathname, hasRole)} />
    </AppLayout>
  )
}