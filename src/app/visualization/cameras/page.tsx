'use client'

import VisualizationLayout from '@/components/layout/VisualizationLayout'
import VisualizationCamera from '@/components/VisualizationCamera'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const VisualizationCamerasPage = () => {
  return (
    <VisualizationLayout 
      title="摄像头监控" 
      description="实时摄像头数据流监控和分析"
    >
      <Suspense fallback={<LoadingSpinner />}>
        {/* <div className="space-y-6"> */}
          {/* 页面头部 */}
          {/* <div>
            <h2 className="text-lg font-semibold">摄像头监控</h2>
            <p className="text-sm text-muted-foreground">
              实时摄像头数据流监控和分析
            </p>
          </div> */}

          {/* 主要内容 */}
          <VisualizationCamera />
        {/* </div> */}
      </Suspense>
    </VisualizationLayout>
  )
}

export default VisualizationCamerasPage