'use client'

import VisualizationLayout from '@/components/layout/VisualizationLayout'
import VisualizationStatisticsAnalysis from '@/components/VisualizationStatisticsAnalysis'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const VisualizationAnalysisPage = () => {
  return (
    <VisualizationLayout 
      title="统计分析" 
      description="历史数据分析和趋势统计"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div className="space-y-6">
          {/* 页面头部 */}
          <div>
            <h2 className="text-lg font-semibold">统计分析</h2>
            <p className="text-sm text-muted-foreground">
              历史数据分析和趋势统计
            </p>
          </div>

          {/* 主要内容 */}
          <VisualizationStatisticsAnalysis />
        </div>
      </Suspense>
    </VisualizationLayout>
  )
}

export default VisualizationAnalysisPage