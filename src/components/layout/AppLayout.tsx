'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  Moon,
  Sun,
  User,
  Home,
  BarChart3,
  Monitor,
  Bell,
  Eye,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: string
  onNavigate: (tab: string) => void
  showSidebar?: boolean
  sidebarContent?: React.ReactNode
}

const navigationItems = [
  { id: 'landing', label: '首页', icon: Home },
  { id: 'dashboard', label: '数据看板', icon: BarChart3 },
  { id: 'workshop', label: '车间大屏', icon: Monitor },
  { id: 'alarm', label: '告警中心', icon: Bell },
  { id: 'visualization', label: '可视化中心', icon: Eye },
  { id: 'users', label: '系统管理', icon: Settings },
]

export default function AppLayout({
  children,
  activeTab,
  onNavigate,
  showSidebar = false,
  sidebarContent
}: AppLayoutProps) {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onNavigate('landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="mr-6">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <BarChart3 className="h-6 w-6" />
              <span>KFM·Scada</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm text-muted-foreground">
                  {user.email}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate('login')}
              >
                登录
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setSidebarOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && sidebarContent && (
          <aside className="hidden lg:block w-64 border-r bg-muted/10">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}