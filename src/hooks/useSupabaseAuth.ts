import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'

/**
 * Hook for Supabase authentication with FastAPI integration
 */
export function useSupabaseAuth() {
  const { user, initialized, signIn, signOut, hasRole } = useAuth()

  // 获取当前用户信息（从 FastAPI）
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      if (!user) return null
      const response = await apiClient.get('/auth/me')
      return response
    },
    enabled: !!user,
    retry: false,
  })

  // 验证 token 有效性
  const verifyToken = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user session')
      const response = await apiClient.post('/auth/verify')
      return response
    },
  })

  // 刷新 token
  const refreshToken = useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
      return response
    },
  })

  // 更新用户资料
  const updateProfile = useMutation({
    mutationFn: async (profileData: { full_name?: string; username?: string; password?: string; new_password?: string }) => {
      const response = await apiClient.put('/auth/update', profileData)
      return response
    },
  })

  // 登出（同时登出 Supabase 和 FastAPI）
  const signOutWithAPI = useMutation({
    mutationFn: async () => {
      try {
        // 调用 FastAPI 登出
        await apiClient.post('/auth/signout')
      } catch (error) {
        console.warn('FastAPI signout failed:', error)
      }
      // 登出 Supabase
      await signOut()
    },
  })

  return {
    // 用户状态
    user,
    currentUser,
    initialized,
    // 认证方法
    signIn,
    signOut: signOutWithAPI.mutate,
    hasRole,
    
    // API 方法
    verifyToken: verifyToken.mutate,
    refreshToken: refreshToken.mutate,
    updateProfile: updateProfile.mutate,
    
    // 状态
    isVerifying: verifyToken.isPending,
    isRefreshing: refreshToken.isPending,
    isUpdating: updateProfile.isPending,
    isSigningOut: signOutWithAPI.isPending,
  }
}
