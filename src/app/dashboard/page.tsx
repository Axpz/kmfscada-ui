'use client'

import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/components/Dashboard'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const DashboardPage = () => {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <Dashboard />
      </Suspense>
    </AppLayout>
  )
}

export default DashboardPage