'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../ui/button'
import {
  Users,
  LayoutDashboard,
  Download,
  LineChart,
  Bell,
  Factory,
  Package2,
  Monitor,
  BarChart3
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Header from './Header'
import { Role } from '@/types'
import Logo from './Logo'

interface AppLayoutProps {
  children: React.ReactNode
}

// 主要功能导航项
const mainNavigationItems: { href: string; label: string; icon: React.ElementType; requiredRole: Role[] | null }[] = [
  { href: '/dashboard', label: '数据看板', icon: LayoutDashboard, requiredRole: null },
  { href: '/workshop', label: '车间大屏', icon: Monitor, requiredRole: null },
  { href: '/visualization', label: '可视化中心', icon: BarChart3, requiredRole: null },
  { href: '/alarms/history', label: '告警中心', icon: Bell, requiredRole: null },
  { href: '/export', label: '数据导出', icon: Download, requiredRole: ['superadmin'] },
  { href: '/management/users', label: '系统管理', icon: Users, requiredRole: ['superadmin'] },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hasRole, initialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // 只有在认证系统初始化完成后才进行路由判断
    if (!initialized) return

    const isPublicPage = ['/login', '/'].includes(pathname)
    if (!user && !isPublicPage) {
      router.push('/login')
    }
  }, [user, initialized, router, pathname])

  const filteredMainItems = useMemo(() => {
    return mainNavigationItems.filter(item => {
      if (!item.requiredRole) return true
      return hasRole(item.requiredRole)
    })
  }, [hasRole])

  const filteredSystemItems = useMemo(() => {
    return mainNavigationItems.filter(item => {
      if (!item.requiredRole) return true
      return hasRole(item.requiredRole)
    })
  }, [hasRole])

  // 如果认证系统还未初始化，显示最小化的加载状态
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">初始化中...</p>
        </div>
      </div>
    )
  }

  // 如果用户未登录且不在公共页面，不渲染任何内容（避免闪烁）
  if (!user && !['/login', '/'].includes(pathname)) {
    return null
  }

  // 登录页面直接渲染子组件
  if (pathname === '/login') {
    return <>{children}</>
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const isActive = pathname.startsWith(href) && (href !== '/' || pathname === '/')
    return (
      <Button
        asChild
        variant={isActive ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setSidebarOpen(false)}
      >
        <Link href={href}>
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    )
  }

  return (
    <div className="min-h-screen w-full flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex-col transition-transform duration-300 ease-in-out md:flex',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Acme Inc</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <Logo />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {/* 主要功能导航 */}
          <div className="space-y-1">
            {filteredMainItems.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* 系统管理分组 */}
          {filteredSystemItems.length > 0 && (
            <div className="pt-4">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                系统管理
              </div>
              <div className="space-y-1">
                {filteredSystemItems.map(item => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>

      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        sidebarOpen ? "md:ml-64" : "md:ml-0"
      )}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-auto">
          <div className={cn(
            "min-h-full p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out",
            !sidebarOpen && "container mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}