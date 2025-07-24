'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts'
import AppLayout from '../components/layout/AppLayout'
import { Sidebar, dashboardSidebarSections, alarmSidebarSections, userSidebarSections } from '../components/layout/Sidebar'
import LoginForm from '../components/LoginForm'
import LandingPage from '../components/LandingPage'
import Dashboard from '../components/Dashboard'
import UserManagement from '../components/UserManagement'
import ProductionForm from '../components/ProductionForm'
import ScadaWorkshopDashboard from '../components/ScadaWorkshopDashboard'
import AlarmCenter from '../components/AlarmCenter'
import VisualizationCenter from '../components/VisualizationCenter'

type TabType = 'landing' | 'login' | 'dashboard' | 'users' | 'add-production' | 'workshop' | 'alarm' | 'visualization'

export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('landing')
  const [sidebarActiveItem, setSidebarActiveItem] = useState<string>('line1')

  // Set initial tab based on user authentication
  useEffect(() => {
    if (user && activeTab === 'login') {
      setActiveTab('dashboard')
    } else if (!user && (activeTab !== 'landing' && activeTab !== 'login')) {
      setActiveTab('landing')
    }
  }, [user, activeTab])

  const handleNavigate = (tab: string) => {
    // 如果用户未登录且尝试访问需要认证的页面，跳转到登录页面
    const protectedTabs = ['dashboard', 'users', 'add-production', 'workshop', 'alarm', 'visualization']
    if (!user && protectedTabs.includes(tab)) {
      setActiveTab('login')
      return
    }
    setActiveTab(tab as TabType)
  }

  const handleSidebarItemClick = (itemId: string) => {
    setSidebarActiveItem(itemId)
    // 这里可以根据不同的 itemId 来更新页面内容
    console.log('Sidebar item clicked:', itemId)
  }

  // 根据当前页面决定是否显示侧边栏和侧边栏内容
  const getSidebarConfig = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          show: true,
          content: (
            <Sidebar
              sections={dashboardSidebarSections.map(section => ({
                ...section,
                items: section.items.map(item => ({
                  ...item,
                  active: item.id === sidebarActiveItem
                }))
              }))}
              onItemClick={handleSidebarItemClick}
            />
          )
        }
      case 'alarm':
        return {
          show: true,
          content: (
            <Sidebar
              sections={alarmSidebarSections.map(section => ({
                ...section,
                items: section.items.map(item => ({
                  ...item,
                  active: item.id === sidebarActiveItem
                }))
              }))}
              onItemClick={handleSidebarItemClick}
            />
          )
        }
      case 'users':
        return {
          show: true,
          content: (
            <Sidebar
              sections={userSidebarSections.map(section => ({
                ...section,
                items: section.items.map(item => ({
                  ...item,
                  active: item.id === sidebarActiveItem
                }))
              }))}
              onItemClick={handleSidebarItemClick}
            />
          )
        }
      default:
        return { show: false, content: null }
    }
  }

  const renderPageContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />
      case 'login':
        return <LoginForm />
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return <UserManagement />
      case 'add-production':
        return (
          <div className="container mx-auto p-6">
            <ProductionForm
              onSuccess={() => {
                setActiveTab('dashboard')
              }}
              onCancel={() => {
                setActiveTab('dashboard')
              }}
            />
          </div>
        )
      case 'workshop':
        return <ScadaWorkshopDashboard />
      case 'alarm':
        return <AlarmCenter />
      case 'visualization':
        return <VisualizationCenter />
      default:
        return <Dashboard />
    }
  }

  // 如果用户未登录，显示简化的布局
  if (!user) {
    if (activeTab === 'landing') {
      return <LandingPage onNavigate={handleNavigate} />
    } else {
      return <LoginForm />
    }
  }

  const sidebarConfig = getSidebarConfig()

  return (
    <AppLayout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      showSidebar={sidebarConfig.show}
      sidebarContent={sidebarConfig.content}
    >
      {renderPageContent()}
    </AppLayout>
  )
}