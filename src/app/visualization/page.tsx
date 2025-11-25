'use client'

import VisualizationLayout from '@/components/layout/VisualizationLayout'
import VisualizationCenter from '@/components/VisualizationCenter'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const VisualizationOverviewPage = () => {
  return (
    <VisualizationLayout
      title="可视化概览"
      description="实时数据展示和图表概览"
    >
      <Suspense fallback={<LoadingSpinner />}>
        {/* <div className="space-y-6 w-full overflow-x-auto"> */}
          {/* 页面头部 */}
          {/* <div>
            <h2 className="text-lg font-semibold">生产线概览</h2>
            <p className="text-sm text-muted-foreground">
              生产线数据概览
            </p>
          </div> */}

          {/* 主要内容 */}
          <VisualizationCenter />
        {/* </div> */}
      </Suspense>
    </VisualizationLayout>
  )
}

export default VisualizationOverviewPage