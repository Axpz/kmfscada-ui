import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:8000'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key'

// 检查是否有 Supabase 配置
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey

if (hasSupabaseConfig) {
  console.log('Using Supabase authentication')
} else {
  console.log('Supabase not configured, using mock authentication')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})