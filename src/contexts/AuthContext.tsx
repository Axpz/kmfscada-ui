'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib'
import type { User } from '@supabase/supabase-js'
import LoadingSpinner from '../components/LoadingSpinner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username?: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // --- Mutations ---
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
  })

  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      username,
      fullName,
    }: {
      email: string
      password: string
      username?: string
      fullName?: string
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username ?? email.split('@')[0],
            full_name: fullName ?? '',
          },
        },
      })
      if (error) throw error
      return data
    },
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  })

  // --- Init & Auth State ---
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Init session error:', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- Auth Functions ---
  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password })
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const params: any = { email, password }
      if (username) params.username = username
      if (fullName) params.fullName = fullName
      await signUpMutation.mutateAsync(params)
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
