'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  BarChart3, 
  Bell, 
  Eye, 
  Settings
} from 'lucide-react'

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
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-background to-muted/20">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-primary">
          智能数据洞察，驱动未来生产力
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-muted-foreground">
          通过实时可视化和智能分析，赋能您的业务决策，提升运营效率。
        </p>
        
       {/* Quick Access Section */}
      <section className="py-10 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            快速访问
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onNavigate('dashboard')}
            >
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">数据看板</h3>
                <p className="text-sm text-muted-foreground">查看实时生产数据</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onNavigate('alarms')}
            >
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">告警中心</h3>
                <p className="text-sm text-muted-foreground">监控系统告警信息</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onNavigate('visualization')}
            >
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">可视化中心</h3>
                <p className="text-sm text-muted-foreground">数据图表与分析</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onNavigate('login')}
            >
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">系统登录</h3>
                <p className="text-sm text-muted-foreground">登录访问完整功能</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="📊"
            title="实时数据可视化"
            description="将复杂数据转化为直观图表，一目了然掌握业务动态。"
          />
          
          <FeatureCard
            icon="💡"
            title="智能预警与分析"
            description="自动识别异常，提供深度洞察，辅助您做出明智决策。"
          />
          
          <FeatureCard
            icon="⚙️"
            title="多维度生产线监控"
            description="全面追踪各生产线状态，优化资源配置，提升生产效率。"
          />
          
          <FeatureCard
            icon="🔒"
            title="安全可靠的数据管理"
            description="企业级数据加密与权限控制，确保您的数据资产安全无虞。"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">系统可用性</div>
            </div>
            
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">实时监控</div>
            </div>
            
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">数据点监控</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}