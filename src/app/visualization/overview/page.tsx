'use client'

import VisualizationLayout from '@/components/layout/VisualizationLayout'
import VisualizationCenter from '@/components/VisualizationCenter'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const VisualizationOverviewPage = () => {
  return (
    <VisualizationLayout 
      title="可视化概览" 
      description="实时数据展示和图表概览"
    >
      <Suspense fallback={<Loader />}>
        <VisualizationCenter />
      </Suspense>
    </VisualizationLayout>
  )
}

const Loader = () => (
  <div className="flex justify-center items-center h-48">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

export default VisualizationOverviewPage