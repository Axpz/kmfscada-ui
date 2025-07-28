'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Logo as UILogo } from './ui/logo'
import { Loader2, AlertCircle, Lock, Mail } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message || '登录失败，请检查您的凭据。')
      } else {
        // On successful sign-in, redirect to the dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('发生未知错误，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md animate-fadeInUp">
        <Card className="shadow-2xl border-2 border-primary/10">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <UILogo size="lg" variant="icon" className="text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              KFM·Scada 系统
            </CardTitle>
            <CardDescription>
              请输入您的凭据以访问系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="animate-fadeInUp">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full transition-all duration-300 transform hover:scale-105 focus:scale-105"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    安全登录
                  </>
                )}
              </Button>
            </form>

            {/* 开发环境测试用户提示 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">快速测试登录</h4>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs"
                    onClick={() => {
                      setEmail('admin@kmf.com')
                      setPassword('admin')
                    }}
                  >
                    <span>超级管理员</span>
                    <span className="font-mono text-muted-foreground">admin / admin</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs"
                    onClick={() => {
                      setEmail('user@kmf.com')
                      setPassword('user')
                    }}
                  >
                    <span>普通用户</span>
                    <span className="font-mono text-muted-foreground">user / user</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs"
                    onClick={() => {
                      setEmail('manager@kmf.com')
                      setPassword('manager123')
                    }}
                  >
                    <span>管理员</span>
                    <span className="font-mono text-muted-foreground">manager@kmf.com</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          © 2025 KFM·Scada. 版权所有
        </div>
      </div>
    </div>
  )
}
 