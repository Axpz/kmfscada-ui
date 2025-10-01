'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  BarChart3, 
  Bell, 
  Eye, 
  Settings,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Users,
  Clock,
  CheckCircle,
  LogIn
} from 'lucide-react'
import NextLink from 'next/link'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
    <CardHeader>
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

interface LandingPageProps {
  onNavigate: (tab: string) => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section - Full Screen */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center py-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
        
        <div className="relative z-10 px-6 text-center w-full">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl block md:hidden font-extrabold mb-8 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent animate-fadeInUp leading-tight">
              <div>智能数据洞察驱动</div>
              <div>未来生产力</div>
            </h1>
            <h1 className="hidden md:block md:text-6xl lg:text-7xl font-extrabold mb-8 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent animate-fadeInUp leading-tight">
              <div>智能数据洞察，驱动未来生产力</div>
            </h1>
            <p className="hidden md:block text-xl md:text-2xl lg:text-3xl mb-16 max-w-4xl mx-auto text-muted-foreground animate-fadeInUp delay-200 leading-relaxed">
              通过实时可视化和智能分析，赋能您的业务决策，提升生产效率。
            </p>
            <div></div>
            {/* Feature Highlights */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fadeInUp delay-400">
              <div>
                <BarChart3 className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="font-semibold text-xl mb-3">实时数据可视化</h3>
                <p className="text-muted-foreground text-base">将复杂数据转化为直观图表</p>
              </div>
              <div>
                <TrendingUp className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="font-semibold text-xl mb-3">智能分析洞察</h3>
                <p className="text-muted-foreground text-base">深度分析助力业务决策</p>
              </div>
              <div>
                <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="font-semibold text-xl mb-3">安全可靠</h3>
                <p className="text-muted-foreground text-base">企业级安全保障</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center sm:justify-start md:justify-end md:pr-32 animate-fadeInUp delay-600">
              <NextLink 
                href="/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  系统登录
                </div>
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}