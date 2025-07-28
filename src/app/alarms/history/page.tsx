'use client'

import AlarmLayout from '@/components/layout/AlarmLayout'
import AlarmCenter from '@/components/AlarmCenter'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const AlarmHistoryPage = () => {
  return (
    <AlarmLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AlarmCenter />
      </Suspense>
    </AlarmLayout>
  )
}

export default AlarmHistoryPage