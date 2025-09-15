'use client'

import ManagementLayout from '@/components/layout/ManagementLayout'
import SecurityAudit from '@/components/SecurityAudit'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const SecurityAuditPage = () => {
  return (
    <>
      <ManagementLayout 
        title="安全审计" 
        description="查看系统安全日志、用户活动记录和异常行为监控"
      >
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <SecurityAudit />
        </Suspense>
      </ManagementLayout>
    </>
  )
}

export default SecurityAuditPage