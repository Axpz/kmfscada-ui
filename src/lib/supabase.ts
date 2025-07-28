import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查是否有 Supabase 配置
const hasSupabaseConfig = false; //supabaseUrl && supabaseAnonKey

if (hasSupabaseConfig) {
  console.log('Using Supabase authentication')
} else {
  console.log('Supabase not configured, using mock authentication')
}

// Mock 用户数据库
const mockUsers = [
  {
    id: '1',
    email: 'admin@kmf.com',
    password: 'admin123',
    app_metadata: { role: 'superadmin' },
    user_metadata: { name: '超级管理员' },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'manager@kmf.com',
    password: 'manager123',
    app_metadata: { role: 'admin' },
    user_metadata: { name: '管理员' },
    aud: 'authenticated',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'operator@kmf.com',
    password: 'operator123',
    app_metadata: { role: 'user' },
    user_metadata: { name: '操作员' },
    aud: 'authenticated',
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    email: 'viewer@kmf.com',
    password: 'viewer123',
    app_metadata: { role: 'user' },
    user_metadata: { name: '查看员' },
    aud: 'authenticated',
    created_at: '2024-01-04T00:00:00Z',
  },
  // 方便测试的简单用户名
  {
    id: '5',
    email: 'admin@kmf.com',
    password: 'admin',
    app_metadata: { role: 'superadmin' },
    user_metadata: { name: '超级管理员' },
    aud: 'authenticated',
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    email: 'user@kmf.com',
    password: 'user',
    app_metadata: { role: 'user' },
    user_metadata: { name: '普通用户' },
    aud: 'authenticated',
    created_at: '2024-01-06T00:00:00Z',
  }
]

// 如果没有 Supabase 配置，创建一个 mock client
const createMockSupabaseClient = () => {
  let currentSession: any = null
  let authStateChangeCallback: any = null

  // 检查本地存储中是否有现有会话
  if (typeof window !== 'undefined') {
    try {
      const storedSession = localStorage.getItem('mock-auth-session')
      if (storedSession) {
        currentSession = JSON.parse(storedSession)
      }
    } catch (error) {
      console.warn('无法读取本地会话:', error)
    }
  }

  return {
    auth: {
      getSession: async () => {
        // 立即返回当前会话，不需要异步等待
        return { 
          data: { session: currentSession }, 
          error: null 
        }
      },
      onAuthStateChange: (callback: any) => {
        authStateChangeCallback = callback
        // 如果有现有会话，立即触发回调
        if (currentSession) {
          setTimeout(() => callback('SIGNED_IN', currentSession), 0)
        } else {
          setTimeout(() => callback('SIGNED_OUT', null), 0)
        }
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log(`Mock 登录尝试: ${email}`)
        
        // 支持简单的用户名登录（不需要@符号）
        const loginIdentifier = email.includes('@') ? email : `${email}@kmf.com`
        
        // 查找匹配的用户
        const mockUser = mockUsers.find(user => 
          (user.email === loginIdentifier && user.password === password) ||
          (user.email === email && user.password === password)
        )
        
        if (mockUser) {
          // 创建用户对象（不包含密码）
          const { password: _, ...userWithoutPassword } = mockUser
          const sessionUser = {
            ...userWithoutPassword,
            created_at: mockUser.created_at,
          }
          
          const session = { 
            user: sessionUser, 
            access_token: `mock-token-${mockUser.id}`,
            expires_at: Date.now() + 3600000 // 1小时后过期
          }
          
          // 保存到本地存储
          if (typeof window !== 'undefined') {
            localStorage.setItem('mock-auth-session', JSON.stringify(session))
          }
          
          currentSession = session
          
          // 触发认证状态变化回调
          if (authStateChangeCallback) {
            setTimeout(() => authStateChangeCallback('SIGNED_IN', session), 0)
          }
          
          console.log(`Mock 登录成功: ${email} (${mockUser.app_metadata.role})`)
          return { 
            data: { 
              user: sessionUser, 
              session: session
            }, 
            error: null 
          }
        }
        
        console.log(`Mock 登录失败: ${email}`)
        return { 
          data: { user: null, session: null }, 
          error: { message: '邮箱或密码错误' } 
        }
      },
      signOut: async () => {
        console.log('Mock 用户退出登录')
        
        // 清理本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock-auth-session')
        }
        
        currentSession = null
        
        // 触发认证状态变化回调
        if (authStateChangeCallback) {
          setTimeout(() => authStateChangeCallback('SIGNED_OUT', null), 0)
        }
        
        return { error: null }
      }
    }
  }
}

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockSupabaseClient() as any