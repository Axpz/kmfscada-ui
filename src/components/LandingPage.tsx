'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { 
  BarChart3, 
  Bell, 
  Eye, 
  Settings, 
  Shield, 
  Zap,
  ArrowRight,
  Factory,
  TrendingUp
} from 'lucide-react'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  delay: number
  themeClasses: any
}

const FeatureCard = ({ icon, title, description, delay, themeClasses }: FeatureCardProps) => (
  <div
    className={`${themeClasses.cardBg} p-6 rounded-lg shadow-md ${themeClasses.cardBorder} border flex flex-col items-center text-center
    transition-transform duration-300 hover:scale-105 animate-fade-in`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-16 h-16 rounded-full ${themeClasses.featureIconBg} flex items-center justify-center mb-4`}>
      <span className={`text-3xl ${themeClasses.featureIconText}`}>{icon}</span>
    </div>
    <h3 className={`text-xl font-semibold mb-2 ${themeClasses.titleColor}`}>{title}</h3>
    <p className={`${themeClasses.placeholderTextColor}`}>{description}</p>
  </div>
)

interface LandingPageProps {
  onNavigate: (tab: string) => void
}

// Theme utility function (matching your original design)
const getThemeClasses = (theme: 'light' | 'dark') => ({
  bodyBg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100',
  textColor: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
  headerNavFooterBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
  cardBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
  cardBorder: theme === 'dark' ? 'border-blue-600' : 'border-blue-400',
  titleColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
  placeholderBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
  placeholderTextColor: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
  buttonPrimaryBg: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
  buttonPrimaryHoverBg: theme === 'dark' ? 'hover:bg-blue-700' : 'hover:bg-blue-600',
  heroBg: theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-white',
  heroTitleColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
  heroDescriptionColor: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
  featureIconBg: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
  featureIconText: theme === 'dark' ? 'text-white' : 'text-white',
  navLinkColor: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
  navLinkHoverColor: theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600',
  navLinkActiveColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
})

export default function LandingPage({ onNavigate }: LandingPageProps) {
  // Get theme from document or default to dark
  const theme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const themeClasses = getThemeClasses(theme)

  return (
    <main className="flex-1 overflow-auto pt-20">
      {/* Hero Section */}
      <section className={`py-20 px-6 text-center ${themeClasses.heroBg} transition-colors duration-300`}>
        <h2 
          className={`text-5xl md:text-6xl font-extrabold mb-4 ${themeClasses.heroTitleColor} animate-fadeInUp`} 
          style={{ animationDelay: '100ms' }}
        >
          智能数据洞察，驱动未来生产力
        </h2>
        <p 
          className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${themeClasses.heroDescriptionColor} animate-fadeInUp`} 
          style={{ animationDelay: '300ms' }}
        >
          通过实时可视化和智能分析，赋能您的业务决策，提升运营效率。
        </p>
        
        {/* Shadcn Button equivalent */}
        <button
          className={`${themeClasses.buttonPrimaryBg} text-white ${themeClasses.buttonPrimaryHoverBg}
          focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 animate-fadeInUp px-8 py-4 text-xl font-semibold rounded-full`}
          onClick={() => onNavigate('dashboard')}
        >
          开始探索 (Start Exploring)
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <h2 
          className={`text-4xl font-bold text-center mb-12 ${themeClasses.titleColor} animate-fadeInUp`} 
          style={{ animationDelay: '700ms' }}
        >
          核心功能 (Core Features)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="📊"
            title="实时数据可视化"
            description="将复杂数据转化为直观图表，一目了然掌握业务动态。"
            delay={900}
            themeClasses={themeClasses}
          />
          
          <FeatureCard
            icon="💡"
            title="智能预警与分析"
            description="自动识别异常，提供深度洞察，辅助您做出明智决策。"
            delay={1100}
            themeClasses={themeClasses}
          />
          
          <FeatureCard
            icon="⚙️"
            title="多维度生产线监控"
            description="全面追踪各生产线状态，优化资源配置，提升生产效率。"
            delay={1300}
            themeClasses={themeClasses}
          />
          
          <FeatureCard
            icon="🔒"
            title="安全可靠的数据管理"
            description="企业级数据加密与权限控制，确保您的数据资产安全无虞。"
            delay={1500}
            themeClasses={themeClasses}
          />
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 
            className={`text-3xl font-bold text-center mb-12 ${themeClasses.titleColor} animate-fadeInUp`}
            style={{ animationDelay: '2000ms' }}
          >
            快速访问
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className={`${themeClasses.cardBg} p-6 rounded-lg shadow-md ${themeClasses.cardBorder} border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in`}
              style={{ animationDelay: '2200ms' }}
              onClick={() => onNavigate('dashboard')}
            >
              <div className="text-center">
                <BarChart3 className={`h-12 w-12 ${themeClasses.titleColor} mx-auto mb-4`} />
                <h3 className={`font-semibold text-lg mb-2 ${themeClasses.textColor}`}>数据看板</h3>
                <p className={`text-sm ${themeClasses.placeholderTextColor}`}>查看实时生产数据</p>
              </div>
            </div>
            
            <div 
              className={`${themeClasses.cardBg} p-6 rounded-lg shadow-md ${themeClasses.cardBorder} border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in`}
              style={{ animationDelay: '2400ms' }}
              onClick={() => onNavigate('alarm')}
            >
              <div className="text-center">
                <Bell className={`h-12 w-12 ${themeClasses.titleColor} mx-auto mb-4`} />
                <h3 className={`font-semibold text-lg mb-2 ${themeClasses.textColor}`}>告警中心</h3>
                <p className={`text-sm ${themeClasses.placeholderTextColor}`}>监控系统告警信息</p>
              </div>
            </div>
            
            <div 
              className={`${themeClasses.cardBg} p-6 rounded-lg shadow-md ${themeClasses.cardBorder} border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in`}
              style={{ animationDelay: '2600ms' }}
              onClick={() => onNavigate('visualization')}
            >
              <div className="text-center">
                <Eye className={`h-12 w-12 ${themeClasses.titleColor} mx-auto mb-4`} />
                <h3 className={`font-semibold text-lg mb-2 ${themeClasses.textColor}`}>可视化中心</h3>
                <p className={`text-sm ${themeClasses.placeholderTextColor}`}>数据图表与分析</p>
              </div>
            </div>
            
            <div 
              className={`${themeClasses.cardBg} p-6 rounded-lg shadow-md ${themeClasses.cardBorder} border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in`}
              style={{ animationDelay: '2800ms' }}
              onClick={() => onNavigate('users')}
            >
              <div className="text-center">
                <Settings className={`h-12 w-12 ${themeClasses.titleColor} mx-auto mb-4`} />
                <h3 className={`font-semibold text-lg mb-2 ${themeClasses.textColor}`}>系统管理</h3>
                <p className={`text-sm ${themeClasses.placeholderTextColor}`}>用户权限管理</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 px-6 ${themeClasses.placeholderBg}`}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '3000ms' }}>
              <div className={`text-4xl font-bold ${themeClasses.titleColor} mb-2`}>99.9%</div>
              <div className={`${themeClasses.placeholderTextColor}`}>系统可用性</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3200ms' }}>
              <div className={`text-4xl font-bold ${themeClasses.titleColor} mb-2`}>24/7</div>
              <div className={`${themeClasses.placeholderTextColor}`}>实时监控</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3400ms' }}>
              <div className={`text-4xl font-bold ${themeClasses.titleColor} mb-2`}>1000+</div>
              <div className={`${themeClasses.placeholderTextColor}`}>数据点监控</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}