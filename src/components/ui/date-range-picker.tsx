"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { format, parse } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// 工具函数
function formatDate(date: Date | undefined) {
  if (!date) return ""
  return format(date, "yyyy-MM-dd HH:mm:ss")
}
function isValidDate(date: Date | undefined) {
  return !!date && !isNaN(date.getTime())
}

export function Calendar24({
  value,
  onChange,
  placeholder = "Select date",
  label = "Date",
  showTime = false,
  timeValue,
  onTimeChange,
}: {
  value?: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  showTime?: boolean
  timeValue?: string
  onTimeChange?: (time: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)

  // 同步外部 value 变化
  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange(selectedDate)
    setOpen(false)
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-36 justify-between font-normal h-8"
              >
              {date ? date.toLocaleDateString() : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      {showTime && (
        <div className="flex flex-col gap-3">
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={timeValue || "00:00:00"}
            onChange={(e) => onTimeChange?.(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-8"
          />
        </div>
      )}
    </div>
  )
}

// 日期范围类型
export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// 日期范围选择器
export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "选择日期时间",
  showTime = false,
}: {
  value?: DateRange | undefined
  onChange: (dateRange: DateRange | undefined) => void
  className?: string
  placeholder?: string
  showTime?: boolean
}) {
  const [range, setRange] = React.useState<DateRange>({ 
    from: value?.from, 
    to: value?.to 
  })
  const [startTime, setStartTime] = React.useState<string>("00:00:00")
  const [endTime, setEndTime] = React.useState<string>("23:59:59")

  React.useEffect(() => {
    if (value) {
      setRange(value)
    }
  }, [value])

  const handleStartChange = (date: Date | undefined) => {
    const newRange = { from: date, to: range.to }
    setRange(newRange)
    onChange(newRange)
  }

  const handleEndChange = (date: Date | undefined) => {
    const newRange = { from: range.from, to: date }
    setRange(newRange)
    onChange(newRange)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4 text-muted-foreground">
        <Calendar24 
          value={range.from}
          onChange={handleStartChange} 
          placeholder="开始时间"
          label="开始日期"
          showTime={showTime}
          timeValue={startTime}
          onTimeChange={setStartTime}
        />
        至
        <Calendar24 
          value={range.to}
          onChange={handleEndChange} 
          placeholder="结束时间"
          label="结束日期"
          showTime={showTime}
          timeValue={endTime}
          onTimeChange={setEndTime}
        />
      </div>
    </div>
  )
}
