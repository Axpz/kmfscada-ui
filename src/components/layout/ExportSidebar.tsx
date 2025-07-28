'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, History } from 'lucide-react'

interface ExportSidebarProps {
  className?: string
}

const exportNavItems = [
  {
    href: '/export',
    label: '数据导出',
    icon: Download,
    description: '配置和创建数据导出任务'
  },
  {
    href: '/export/history',
    label: '导出历史',
    icon: History,
    description: '查看导出任务历史记录'
  }
]

export default function ExportSidebar({ className }: ExportSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("w-64 hidden md:flex md:flex-col", className)}>
      <nav className="flex-1 space-y-1 p-2">
        <div className="space-y-1">
          {exportNavItems.map((item) => {
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
    </div>
  )
}