/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能 - 更保守的设置
  experimental: {
    // 暂时禁用 React 19 编译器以避免兼容性问题
    // reactCompiler: true,
    // 启用优化
    optimizePackageImports: ['lucide-react'],
  },
  
  // 输出配置 - 支持 Docker 部署
  output: 'standalone',
  
  // 服务器外部包配置
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 压缩配置
  compress: true,
  
  // 性能优化
  poweredByHeader: false,
  
  // 类型检查
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 添加 webpack 配置以提高稳定性
  webpack: (config, { isServer }) => {
    // 添加错误处理
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // 优化模块解析
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
}

module.exports = nextConfig 