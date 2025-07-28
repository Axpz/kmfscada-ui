'use client'

import AlarmLayout from '@/components/layout/AlarmLayout'
import AlarmRules from '@/components/AlarmRules'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const AlarmRulesPage = () => {
  return (
    <AlarmLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AlarmRules />
      </Suspense>
    </AlarmLayout>
  )
}

export default AlarmRulesPage