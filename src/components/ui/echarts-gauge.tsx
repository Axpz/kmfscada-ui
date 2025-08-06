'use client'

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface EChartsGaugeProps {
  value: number
  max: number
  min?: number
  title: string
  unit: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const EChartsGauge: React.FC<EChartsGaugeProps> = ({
  value,
  max,
  min = 0,
  title,
  unit,
  color = '#8b5cf6',
  size = 'md',
  className = ''
}) => {
  const sizeConfig = {
    sm: { width: 280, height: 200, fontSize: 12 },
    md: { width: 350, height: 250, fontSize: 14 },
    lg: { width: 420, height: 300, fontSize: 16 }
  }

  const config = sizeConfig[size]

  const option: EChartsOption = useMemo(() => {
    // 根据数值计算颜色
    const getProgressColor = (val: number) => {
      const ratio = val / max
      if (ratio <= 0.6) return '#10b981' // 绿色 - 正常
      if (ratio <= 0.8) return '#f59e0b' // 黄色 - 注意  
      return '#ef4444' // 红色 - 警告
    }

    const progressColor = getProgressColor(value)

    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          center: ['50%', '70%'],
          radius: '85%',
          min,
          max,
          splitNumber: 10,
          itemStyle: {
            color: progressColor,
            shadowColor: progressColor + '40',
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowOffsetY: 3
          },
          progress: {
            show: true,
            roundCap: true,
            width: 20,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: progressColor },
                  { offset: 0.5, color: progressColor + 'DD' },
                  { offset: 1, color: progressColor + 'AA' }
                ]
              },
              shadowColor: progressColor + '60',
              shadowBlur: 12,
              shadowOffsetY: 4
            }
          },
          pointer: {
            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
            length: '70%',
            width: 18,
            offsetCenter: [0, '8%'],
            itemStyle: {
              color: '#2d3748',
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 8,
              shadowOffsetY: 2
            }
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 20,
            itemStyle: {
              borderWidth: 3,
              borderColor: '#2d3748',
              color: '#ffffff',
              shadowColor: 'rgba(0,0,0,0.2)',
              shadowBlur: 6
            }
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 20,
              color: [
                [0.6, '#e2e8f0'],
                [0.8, '#f1f5f9'], 
                [1, '#f8fafc']
              ]
            }
          },
          axisTick: {
            distance: -25,
            splitNumber: 2,
            lineStyle: {
              width: 2,
              color: '#64748b'
            }
          },
          splitLine: {
            distance: -30,
            length: 14,
            lineStyle: {
              width: 3,
              color: '#475569'
            }
          },
          axisLabel: {
            distance: -45,
            color: '#374151',
            fontSize: config.fontSize + 2,
            fontWeight: '600'
          },
          title: {
            show: true,
            offsetCenter: [0, '-50%'],
            fontSize: config.fontSize + 4,
            fontWeight: 'bold',
            color: '#1e293b'
          },
          detail: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: progressColor,
            borderWidth: 3,
            width: '70%',
            lineHeight: 50,
            height: 50,
            borderRadius: 12,
            offsetCenter: [0, '40%'],
            valueAnimation: true,
            shadowColor: 'rgba(0,0,0,0.1)',
            shadowBlur: 10,
            shadowOffsetY: 3,
            formatter: function (val: number) {
              return `{value|${val.toFixed(0)}}{unit| ${unit}}`
            },
            rich: {
              value: {
                fontSize: config.fontSize + 18,
                fontWeight: 'bold',
                color: progressColor,
                fontFamily: 'system-ui, -apple-system, sans-serif'
              },
              unit: {
                fontSize: config.fontSize + 4,
                color: '#64748b',
                fontWeight: '500',
                padding: [0, 0, 0, 4]
              }
            }
          },
          data: [
            {
              value,
              name: title
            }
          ]
        }
      ]
    }
  }, [value, max, min, title, unit, color, config])

  return (
    <div className={`inline-block bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 shadow-lg ${className}`}>
      <ReactECharts
        option={option}
        style={{ 
          width: config.width, 
          height: config.height 
        }}
        opts={{ 
          renderer: 'canvas',
          devicePixelRatio: 2
        }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}