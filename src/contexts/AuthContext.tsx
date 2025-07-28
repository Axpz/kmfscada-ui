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
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      const currentRole = (currentUser?.app_metadata?.role as Role) ?? null
      setUser(currentUser)
      setRole(currentRole)
      setLoading(false)
      setInitialized(true)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        const currentUser = session?.user ?? null
        const currentRole = (currentUser?.app_metadata?.role as Role) ?? null
        setUser(currentUser)
        setRole(currentRole)
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
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    window.location.href = '/login'
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
