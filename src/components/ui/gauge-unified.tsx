'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

export interface GaugeConfig {
  title: string
  unit: string
  max: number
  min: number
  color: string
  decimalPlaces?: number
}

interface UnifiedGaugeProps {
  value: number
  config: GaugeConfig
  className?: string
}

/**
 * Configurable Gauge component that can display different types of metrics
 * with configurable titles, units, ranges, and colors
 */
export const ConfigurableGauge: React.FC<UnifiedGaugeProps> = ({
  value,
  config,
  className
}) => {
  const { title, unit, max, min, color, decimalPlaces = 1 } = config
  
  // Calculate the progress percentage for the color mapping
  const progress = Math.min(value / max, 1)

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '100%',
        min,
        max,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 12,
            // Use progress-based color mapping
            color: [
              [progress, color], // Configurable color for progress
              [1, 'hsl(var(--muted))'] // Muted color for remaining
            ]
          }
        },
        pointer: {
          length: '60%',
          width: 5,
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -20,
          length: 6,
          lineStyle: {
            color: 'hsl(var(--muted-foreground))',
            width: 1
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 8,
          distance: -20
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 6,
          itemStyle: {
            borderWidth: 2,
            borderColor: 'hsl(var(--muted-foreground))',
            color: 'hsl(var(--background))'
          }
        },
        title: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  }

  return (
    <div className={cn(
      'flex flex-col w-48 h-40',
      className
    )}>
      <div className="flex items-center justify-center px-4 pt-3 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>

      <div className="flex-1 px-2">
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>

      <div className="flex items-center justify-center px-4 pb-3">
        <span className="text-sm">{value.toFixed(decimalPlaces)}</span>
        <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

// Default export for consistency
export default ConfigurableGauge
