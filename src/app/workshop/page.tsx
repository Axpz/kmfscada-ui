'use client'

import AppLayout from '@/components/layout/AppLayout'
import ScadaWorkshopDashboard from '@/components/ScadaWorkshopDashboard'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function WorkshopPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <ScadaWorkshopDashboard />
      </Suspense>
    </AppLayout>
  )
}