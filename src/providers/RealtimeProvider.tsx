'use client'

import React from 'react'
import { RealtimeDataProvider } from '@/contexts/RealtimeDataContext'
import { RealtimeErrorBoundary } from './RealtimeErrorBoundary'

interface RealtimeProviderProps {
  children: React.ReactNode
}

/**
 * 实时数据全局提供者
 * 
 * 遵循 Next.js 最佳实践:
 * - 使用 'use client' 指令标记客户端组件
 * - 包含错误边界处理
 * - 简单的 wrapper 组件，便于管理和测试
 * - 统一的 providers 结构
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return (
    <RealtimeErrorBoundary>
      <RealtimeDataProvider>
        {children}
      </RealtimeDataProvider>
    </RealtimeErrorBoundary>
  )
}

export default RealtimeProvider
