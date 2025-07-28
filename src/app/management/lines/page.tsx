'use client'

import ManagementLayout from '@/components/layout/ManagementLayout'
import ProductionLineManagement from '@/components/ProductionLineManagement'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const LinesPage = () => {
  return (
    <ManagementLayout 
      title="生产线管理" 
      description="配置和管理生产线设备、参数和监控设置"
    >
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <ProductionLineManagement />
      </Suspense>
    </ManagementLayout>
  )
}

export default LinesPage
