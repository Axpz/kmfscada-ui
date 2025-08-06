"use client"

import React from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AlarmRecord } from '@/types'
import dayjs from 'dayjs'
import Link from 'next/link'

interface AlarmNotificationProps {
  alarms: AlarmRecord[]
  isLoading?: boolean
}

export function AlarmNotification({ alarms, isLoading }: AlarmNotificationProps) {
  const [open, setOpen] = React.useState(false)
  
  // 获取未确认的告警
  const unacknowledgedAlarms = alarms?.filter(alarm => !alarm.acknowledged) || []
  const hasUnacknowledgedAlarms = unacknowledgedAlarms.length > 0

  // 获取最近的5条未确认告警用于预览
  const recentAlarms = unacknowledgedAlarms
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 transition-colors",
            hasUnacknowledgedAlarms 
              ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Bell className={cn(
            "h-4 w-4 transition-all",
            hasUnacknowledgedAlarms && "animate-pulse"
          )} />
          {hasUnacknowledgedAlarms && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center",
                "bg-amber-500 text-white border-0 hover:bg-amber-600",
                "dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-700"
              )}
            >
              {unacknowledgedAlarms.length > 99 ? '99+' : unacknowledgedAlarms.length}
            </Badge>
          )}
          <span className="sr-only">
            {hasUnacknowledgedAlarms ? `${unacknowledgedAlarms.length}条未确认告警` : '无告警'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-border/50 dark:border-border" align="end">
        <div className="flex items-center justify-between p-4 pb-2 bg-background">
          <h4 className="font-semibold text-sm text-foreground">告警通知</h4>
          {hasUnacknowledgedAlarms && (
            <Badge 
              className={cn(
                "text-xs bg-amber-100 text-amber-800 border-amber-200",
                "dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/50"
              )}
            >
              {unacknowledgedAlarms.length}条未确认
            </Badge>
          )}
        </div>
        
        <Separator className="dark:border-border/50" />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : !hasUnacknowledgedAlarms ? (
          <div className="p-4 text-center bg-background">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无未确认告警</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-64 bg-background">
              <div className="p-2">
                {recentAlarms.map((alarm, index) => (
                  <div
                    key={alarm.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md transition-colors",
                      "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
                      index !== recentAlarms.length - 1 && "mb-1"
                    )}
                  >
                    <AlertTriangle className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      "text-amber-600 dark:text-amber-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        "text-amber-700 dark:text-amber-300"
                      )}>
                        生产线 #{alarm.production_line_id}
                      </p>
                      <p className="text-xs text-foreground/80 dark:text-foreground/70 truncate">
                        {alarm.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(alarm.timestamp).format('MM-DD HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {unacknowledgedAlarms.length > 5 && (
              <>
                <Separator className="dark:border-border/50" />
                <div className="p-2 text-center bg-background">
                  <p className="text-xs text-muted-foreground">
                    还有 {unacknowledgedAlarms.length - 5} 条告警...
                  </p>
                </div>
              </>
            )}
            
            <Separator className="dark:border-border/50" />
            <div className="p-2 bg-background">
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className={cn(
                  "w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800",
                  "dark:border-amber-800/50 dark:text-amber-300 dark:hover:bg-amber-950/20 dark:hover:text-amber-200"
                )}
              >
                <Link href="/alarms/history">
                  查看所有告警
                </Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}