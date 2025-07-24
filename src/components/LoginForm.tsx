'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Logo } from './ui/logo'
import { Loader2, AlertCircle, Lock, Mail, User, UserPlus } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username, fullName)
        if (error) {
          setError(error.message)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setFullName('')
    setError('')
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md animate-fadeInUp">
        <Card className="shadow-2xl border-2 border-primary/10">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Logo size="sm" className="text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary animate-fade-in" style={{ animationDelay: '400ms' }}>
              KFM·Scada
            </CardTitle>
            <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
              {isSignUp ? '创建您的账户' : '登录到您的账户'}
            </p>
          </CardHeader>
          <CardContent className="animate-fade-in" style={{ animationDelay: '800ms' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              
              {isSignUp && (
                <>
                  <div className="space-y-2 animate-slideInFromRight">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      用户名
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  
                  <div className="space-y-2 animate-slideInFromRight" style={{ animationDelay: '100ms' }}>
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      全名
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="请输入您的全名"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入您的密码"
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
                    {isSignUp ? '创建账户中...' : '登录中...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        注册账户
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        立即登录
                      </>
                    )}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  className="text-sm transition-colors duration-200 hover:text-primary"
                >
                  {isSignUp ? '已有账户？立即登录' : '没有账户？立即注册'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '1000ms' }}>
          © 2025 KFM·Scada. 版权所有
        </div>
      </div>
    </div>
  )
} 