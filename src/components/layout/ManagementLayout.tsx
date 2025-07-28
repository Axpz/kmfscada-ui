'use client'

import React from 'react'
import AppLayout from './AppLayout'
import ManagementSidebar from './ManagementSidebar'
import { useAuth } from '@/contexts'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const { hasRole } = useAuth()

  // 检查用户是否有管理权限
  if (!hasRole(['superadmin'])) {
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
          {/* 内容头部 */}
          {/* <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div> */}
          
          {/* 内容主体 */}
          <div className="flex-1 p-1 overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}