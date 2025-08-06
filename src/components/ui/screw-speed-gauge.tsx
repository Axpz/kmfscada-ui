'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils' // Assuming this is a utility for merging Tailwind classes

interface ScrewSpeedGaugeProps {
  value: number
  max?: number
  min?: number
  className?: string
}

/**
 * A simplified gauge component to display screw speed.
 * This version removes detailed styling for a cleaner look and uses the axis line
 * color to visually represent the current value.
 */
export const ScrewSpeedGauge: React.FC<ScrewSpeedGaugeProps> = ({
  value,
  max = 200,
  min = 0,
  className
}) => {
  // Calculate the progress percentage for the color mapping
  const progress = value / max

  const option = {
    series: [
      {
        type: 'gauge',
        // Set the start and end angles for a semi-circle gauge
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'], // Center the gauge in the container
        radius: '100%', // Make the gauge fill the container
        min,
        max,
        splitNumber: 4, // Number of major ticks
        axisLine: {
          lineStyle: {
            width: 12, // A slightly thicker line
            // Use a color gradient on the axis line to show progress
            color: [
              [progress, '#3b82f6'], // Color for the value portion (blue)
              [1, '#e5e7eb']      // Color for the remaining portion (gray)
            ]
          }
        },
        // Use the default pointer for a cleaner look
        pointer: {
          length: '60%',
          width: 5,
          itemStyle: {
            color: 'auto' // The pointer will automatically take the color of the section it's in
          }
        },
        // Simplified axis ticks
        axisTick: {
          distance: -20,
          length: 6,
          lineStyle: {
            color: '#6b7280',
            width: 1
          }
        },
        // Removed splitLine for a cleaner background
        splitLine: {
          show: false,
        },
        // Simplified axis labels
        axisLabel: {
          color: '#4b5563',
          fontSize: 8,
          distance: -20, // Position labels inside the gauge
        },
        // Detail and title are hidden, as we render them manually in React
        detail: {
          show: false
        },
        title: {
          show: false
        },
        data: [
          {
            value: value,
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
        <h3 className="text-sm font-medium">螺杆转速</h3>
      </div>

      <div className="flex-1 px-2">
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>

      <div className="flex items-center justify-center px-4 pb-3">
        <span className="ml-1 text-sm">{value}</span>
        <span className="ml-1 text-sm text-muted-foreground">rpm</span>
      </div>
    </div>
  )
}

// Default export for use in other files
export default ScrewSpeedGauge
