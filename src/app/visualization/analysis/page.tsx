'use client'

import VisualizationLayout from '@/components/layout/VisualizationLayout'
import DataStatisticsAnalysis from '@/components/DataStatisticsAnalysis'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const VisualizationAnalysisPage = () => {
  return (
    <VisualizationLayout 
      title="统计分析" 
      description="历史数据分析和趋势统计"
    >
      <Suspense fallback={<Loader />}>
        <DataStatisticsAnalysis />
      </Suspense>
    </VisualizationLayout>
  )
}

const Loader = () => (
  <div className="flex justify-center items-center h-48">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

export default VisualizationAnalysisPage