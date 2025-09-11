'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { Role } from '@/types'
import { useAuthSignin } from '@/hooks/useApi'

interface AuthContextType {
  user: SupabaseUser | null
  role: Role | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasRole: (requiredRole: Role | Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session fetch error:', error)
          setUser(null)
          setRole(null)
        } else {
          const currentUser = session?.user ?? null
          const currentRole = currentUser?.user_metadata?.role ?? 'user' as Role
          setUser(currentUser)
          setRole(currentRole)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        setUser(null)
        setRole(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        // 如果是 SIGNED_OUT 事件，确保清除状态
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setRole(null)
        } else {
          const currentUser = session?.user ?? null
          const currentRole = (currentUser?.user_metadata?.role as Role) ?? null
          setUser(currentUser)
          setRole(currentRole)
        }
        setLoading(false)
        setInitialized(true)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // 先清除本地状态
      setUser(null)
      setRole(null)
      
      // 清除所有可能的本地存储
      localStorage.clear()
      sessionStorage.clear()
      
      // 登出 Supabase
      await supabase.auth.signOut()
      
      // 强制刷新页面以确保完全清除状态
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      // 即使出错也要清除本地状态
      setUser(null)
      setRole(null)
      window.location.href = '/login'
    }
  }

  const hasRole = useCallback((required: Role | Role[]) => {
    if (!role) return false
    const list = Array.isArray(required) ? required : [required]
    return list.includes(role)
  }, [role])

  return (
    <AuthContext.Provider
      value={{ user, role, loading, initialized, signIn, signOut, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
