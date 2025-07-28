'use client'

import ExportLayout from '@/components/layout/ExportLayout'
import ExportHistory from '@/components/ExportHistory'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ExportHistoryPage = () => {
  return (
    <ExportLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <ExportHistory />
      </Suspense>
    </ExportLayout>
  )
}

export default ExportHistoryPage