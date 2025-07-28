import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // 简化的中间件，主要处理路由重定向
  // 在生产环境中，你可能需要更复杂的认证逻辑
  
  // 公开路由，不需要认证
  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // 对于根路径，重定向到仪表板（如果用户已登录）或着陆页
  if (req.nextUrl.pathname === '/') {
    // 这里可以添加更复杂的逻辑来检查用户是否已登录
    // 现在简单地重定向到着陆页，让客户端处理认证
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}