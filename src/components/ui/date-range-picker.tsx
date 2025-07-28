"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
  value,
  onChange,
  disabled,
  className,
}: {
  value: DateRange | undefined
  onChange: (val: DateRange | undefined) => void
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-8 text-xs px-2",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "MM-dd")} ~ {format(value.to, "MM-dd")}
                </>
              ) : (
                format(value.from, "MM-dd")
              )
            ) : (
              <span>选择日期</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from || new Date()}
            selected={value}
            onSelect={onChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}