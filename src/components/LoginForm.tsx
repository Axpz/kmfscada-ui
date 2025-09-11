'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, AlertCircle, Lock, Mail } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useAuthSignin } from '@/hooks/useApi'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useSupabaseAuth()
  const router = useRouter()
  const { mutate: mutateSignin, isPending } = useAuthSignin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // use python backend to sign in for audit
      await mutateSignin({ email, password })

      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message || '登录失败，请检查您的凭据。')
      } else {
        // On successful sign-in, redirect to the dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('LoginForm error:', err)
      setError('发生未知错误，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Card className="shadow-2xl border border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
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
                    登录
                  </>
                )}
              </Button>
            </form>
        </CardContent>
      </Card>
      
      <div className="text-center mt-6 text-sm text-muted-foreground">
        © 2025 KFM·Scada. 版权所有
      </div>
    </div>
  )
}
 