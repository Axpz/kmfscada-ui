'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  maxCount?: number
  maxDisplay?: number
  className?: string
  disabled?: boolean
  clearable?: boolean
}

const MultiSelect = React.forwardRef<
  React.ElementRef<typeof Button>,
  MultiSelectProps
>(({
  options,
  value,
  onValueChange,
  placeholder = "选择选项",
  maxCount,
  maxDisplay = 3,
  className,
  disabled = false,
  clearable = true,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback((optionValue: string) => {
    if (disabled) return
    
    const isSelected = value.includes(optionValue)
    let newValue: string[]
    
    if (isSelected) {
      newValue = value.filter(v => v !== optionValue)
    } else {
      if (maxCount && value.length >= maxCount) {
        return // 达到最大选择数量
      }
      newValue = [...value, optionValue]
    }
    
    onValueChange(newValue)
  }, [value, onValueChange, disabled, maxCount])

  const handleRemove = React.useCallback((optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    onValueChange(value.filter(v => v !== optionValue))
  }, [value, onValueChange, disabled])

  const handleClear = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    onValueChange([])
  }, [onValueChange, disabled])

  const selectedOptions = React.useMemo(() => {
    return value.map(v => options.find(opt => opt.value === v)).filter(Boolean) as MultiSelectOption[]
  }, [value, options])

  const renderValue = () => {
    if (value.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    if (value.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs px-2 py-0.5 h-5"
            >
              {option.label}
            </Badge>
          ))}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
          已选择 {value.length} 项
        </Badge>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between min-h-8 h-auto py-1.5",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <div className="flex-1 text-left overflow-hidden">
            {renderValue()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={4}>
        <div className="p-1">
          {/* 选项列表 */}
          <div className="max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                暂无选项
              </div>
            ) : (
              options.map(option => {
                const isSelected = value.includes(option.value)
                const isDisabled = option.disabled || (maxCount && !isSelected && value.length >= maxCount)
                
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors",
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => !isDisabled && handleSelect(option.value)}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="flex-1">{option.label}</span>
                    {maxCount && (
                      <span className="text-xs text-muted-foreground">
                        {isSelected ? '✓' : ''}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
          
          {/* 底部操作区 */}
          {(value.length > 0 && clearable) && (
            <>
              <Separator className="my-1" />
              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="w-full h-7 text-xs justify-center"
                  disabled={disabled}
                >
                  清除所有选择
                </Button>
              </div>
            </>
          )}
          
          {/* 计数信息 */}
          {maxCount && (
            <>
              <Separator className="my-1" />
              <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                已选择 {value.length} / {maxCount} 项
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }