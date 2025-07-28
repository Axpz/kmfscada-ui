
'use client'

import AppLayout from '@/components/layout/AppLayout'
import AuditPage from '@/components/AuditPage'
import { useAuth } from '@/contexts'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function Page() {
  const { hasRole } = useAuth()

  // Double-check permissions on the client-side
  if (!hasRole('superadmin')) {
    return (
      <AppLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive">无权访问</h1>
          <p className="text-muted-foreground mt-2">
            只有超级管理员才能查看安全审计。
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AuditPage />
      </Suspense>
    </AppLayout>
  )
}
