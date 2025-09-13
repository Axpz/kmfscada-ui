"use client"

import React, { useState } from "react"
import { DateTimePicker, DateTimeRangePicker, DateRange } from "@/components/ui/date-range-picker"

export function DatePickerExample() {
  const [singleDateTime, setSingleDateTime] = useState<Date | undefined>(new Date())
  const [dateOnly, setDateOnly] = useState<Date | undefined>(new Date())
  const [dateTimeRange, setDateTimeRange] = useState<DateRange | undefined>(() => ({
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
  }))
  const [dateOnlyRange, setDateOnlyRange] = useState<DateRange | undefined>(undefined)

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">日期时间选择器示例</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">日期时间选择</h3>
            <DateTimePicker
              value={singleDateTime}
              onChange={setSingleDateTime}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-600">
              选择的值: {singleDateTime ? singleDateTime.toLocaleString() : '未选择'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">仅日期选择</h3>
            <DateTimePicker
              value={dateOnly}
              onChange={setDateOnly}
              showTime={false}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-600">
              选择的值: {dateOnly ? dateOnly.toLocaleDateString() : '未选择'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">日期时间范围选择</h3>
            <DateTimeRangePicker
              value={dateTimeRange}
              onChange={setDateTimeRange}
              className="max-w-md"
            />
            <p className="text-sm text-gray-600">
              选择的值: {dateTimeRange ? 
                `${dateTimeRange.from?.toLocaleString()} ~ ${dateTimeRange.to?.toLocaleString()}` : 
                '未选择'
              }
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">仅日期范围选择</h3>
            <DateTimeRangePicker
              value={dateOnlyRange}
              onChange={setDateOnlyRange}
              showTime={false}
              className="max-w-md"
            />
            <p className="text-sm text-gray-600">
              选择的值: {dateOnlyRange ? 
                `${dateOnlyRange.from?.toLocaleDateString()} ~ ${dateOnlyRange.to?.toLocaleDateString()}` : 
                '未选择'
              }
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">禁用状态</h3>
            <DateTimeRangePicker
              value={undefined}
              onChange={() => {}}
              disabled={true}
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
