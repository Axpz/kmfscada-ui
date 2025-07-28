'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AlarmsPage = () => {
  const router = useRouter()

  useEffect(() => {
    // 重定向到报警历史页面
    router.replace('/alarms/history')
  }, [router])

  return null
}

export default AlarmsPage
