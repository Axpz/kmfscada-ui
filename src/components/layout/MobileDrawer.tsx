'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Role } from '@/types'
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Download,
  Users,
  X
} from 'lucide-react'
import Logo from './Logo'

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mainNavItems = [
  { href: '/dashboard', label: '数据看板', icon: LayoutDashboard, requiredRole: null },
  { href: '/visualization', label: '可视化中心', icon: BarChart3, requiredRole: null },
  { href: '/alarms/history', label: '告警中心', icon: Bell, requiredRole: null },
  { href: '/export', label: '数据导出', icon: Download, requiredRole: ['super_admin'] as Role[] },
  { href: '/management/lines', label: '系统管理', icon: Users, requiredRole: null },
]

export default function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname()
  const { hasRole } = useSupabaseAuth()

  const filteredItems = mainNavItems.filter(item => {
    if (!item.requiredRole) return true
    return hasRole(item.requiredRole)
  })

  const isActive = (href: string) => {
    if (href === '/management/lines') {
      return pathname.startsWith('/management')
    }
    if (href === '/alarms/history') {
      return pathname.startsWith('/alarms')
    }
    return pathname.startsWith(href) && (href !== '/' || pathname === '/')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle></SheetTitle>
          <div className="flex items-center justify-between">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
            </Button>
          </div>
        </SheetHeader>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {filteredItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-start h-12 text-base"
                  onClick={() => onOpenChange(false)}
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
