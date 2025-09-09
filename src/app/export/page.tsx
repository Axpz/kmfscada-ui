'use client'

import ExportLayout from '@/components/layout/ExportLayout'
import DataExport from '@/components/DataExport'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ExportPage = () => {
  return (
    <ExportLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <DataExport />
      </Suspense>
    </ExportLayout>
  )
}

export default ExportPage