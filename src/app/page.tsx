'use client'

import { useRouter } from 'next/navigation'
import LandingPage from '../components/LandingPage'

export default function HomePage() {
  const router = useRouter()

  const handleNavigate = (destination: string) => {
    switch (destination) {
      case 'login':
        router.push('/login')
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      default:
        router.push(`/${destination}`)
    }
  }

  // 着陆页面不需要认证检查，直接显示
  return <LandingPage onNavigate={handleNavigate} />
}