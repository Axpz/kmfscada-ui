'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Maximize2, Minimize2, Download, Settings, X } from 'lucide-react'

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
  const fullscreenRef = useRef<HTMLDivElement>(null)

  // 监听浏览器全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement)
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // 先设置状态，让全屏内容渲染
      setIsFullscreen(true)
      
      // 等待下一个渲染周期，确保fullscreenRef.current存在
      setTimeout(async () => {
        if (fullscreenRef.current) {
          try {
            // 尝试不同的全屏API方法
            const element = fullscreenRef.current as any
            
            if (element.requestFullscreen) {
              await element.requestFullscreen()
            } else if (element.webkitRequestFullscreen) {
              await element.webkitRequestFullscreen()
            } else if (element.mozRequestFullScreen) {
              await element.mozRequestFullScreen()
            } else if (element.msRequestFullscreen) {
              await element.msRequestFullscreen()
            } else {
              throw new Error('浏览器不支持全屏API')
            }
            
            console.log('✅ 成功进入浏览器原生全屏')
          } catch (error: any) {
            console.error('❌ 浏览器全屏失败:', error?.message || error)
            // 如果全屏失败，至少保持CSS全屏状态
          }
        }
      }, 100)
    } else {
      try {
        // 尝试不同的退出全屏API方法
        const doc = document as any
        
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
        
        console.log('✅ 退出浏览器原生全屏')
      } catch (error: any) {
        console.error('❌ 退出全屏失败:', error?.message || error)
      }
      
      // 无论如何都要退出我们的全屏状态
      setIsFullscreen(false)
    }
  }

  return (
    <>
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
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                {/* <Button variant="ghost" size="sm" title="下载图表">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="设置">
                  <Settings className="h-4 w-4" />
                </Button> */}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>

      {/* 浏览器原生全屏内容 */}
      {isFullscreen && (
        <div 
          ref={fullscreenRef}
          className="w-screen h-screen bg-background flex flex-col"
        >
          {/* 全屏头部 */}
          {/* <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <Icon className={`h-6 w-6 ${iconColor}`} />
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="退出全屏 (ESC)"
                className="hover:bg-muted/50"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                title="下载图表"
                className="hover:bg-muted/50"
                onClick={() => console.log('下载图表')}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                title="设置"
                className="hover:bg-muted/50"
                onClick={() => console.log('设置')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="关闭"
                className="hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div> */}

          {/* 副标题 */}
          {/* <div className="px-6 py-2 border-b bg-muted/30">
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div> */}

          {/* 全屏内容区域 */}
          <div className="flex-1 p-6 overflow-auto bg-background">
            {children}
          </div>
        </div>
      )}
    </>
  )
}