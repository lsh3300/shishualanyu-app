import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const enableDevRoutes = process.env.ENABLE_DEV_ROUTES?.toLowerCase() === 'true'
  const isTestApiRoute = pathname.startsWith('/api/test')
  const isAdminDevApiRoute =
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/api/init-') ||
    pathname === '/api/game/init-db' ||
    pathname.startsWith('/api/products/create-test-product') ||
    pathname.startsWith('/api/products/add-indigo')

  const isDevApiRoute = isTestApiRoute || isAdminDevApiRoute

  if (isDevApiRoute && !enableDevRoutes) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  if (isAdminDevApiRoute) {
    const adminSecret = process.env.ADMIN_SECRET?.trim()
    if (adminSecret) {
      const provided = request.headers.get('x-admin-secret')?.trim()
      if (!provided || provided !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  // 刷新 Supabase 认证 session
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 刷新 session（这会自动更新过期的 token）
    await supabase.auth.getUser()
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon 文件)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}