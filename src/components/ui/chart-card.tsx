'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Maximize2, Minimize2 } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  actions?: boolean
}

export const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  actions = true
}: ChartCardProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 简单的CSS全屏切换
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      // 防止页面滚动
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* 全屏头部 */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${iconColor}`} />
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="退出全屏 (ESC)"
            className="hover:bg-muted"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 全屏内容区域 - 自适应剩余高度 */}
        <div className="flex-1 min-h-0 p-6 overflow-auto">
          {children}
        </div>
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {actions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="全屏显示"
                className="hover:bg-muted"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}