'use client'

import React from 'react'
import AppLayout from './AppLayout'
import AlarmSidebar from './AlarmSidebar'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Bell } from 'lucide-react'
import { Role } from '@/types'

interface AlarmLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function AlarmLayout({ 
  children, 
  title = "报警中心",
  description = "查看历史报警记录并配置报警规则"
}: AlarmLayoutProps) {
  const { hasRole } = useSupabaseAuth()

  // 检查用户是否有报警功能权限
  if (!hasRole(['super_admin', 'admin', 'user'] as Role[])) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div>
              <h1 className="text-2xl font-bold text-destructive">访问被拒绝</h1>
              <p className="text-muted-foreground mt-2">
                您没有权限访问报警中心功能。请联系系统管理员。
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
        {/* 报警功能侧边栏 */}
        <AlarmSidebar className="flex-shrink-0" />
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* 内容主体 */}
          <div className="flex-1 p-1 overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}