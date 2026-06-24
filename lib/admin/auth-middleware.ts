import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export type AdminAuthErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'PROFILE_NOT_FOUND'
  | 'NOT_ADMIN'
  | 'ACCOUNT_DISABLED'

export interface AdminProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: string
  status: string
}

export interface AdminAuthResult {
  success: boolean
  userId: string | null
  profile: AdminProfile | null
  error: string | null
  errorCode: AdminAuthErrorCode | null
}

export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  const supabase = createServiceClient()
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      userId: null,
      profile: null,
      error: '未授权访问',
      errorCode: 'UNAUTHORIZED',
    }
  }

  const token = authHeader.substring(7).trim()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return {
      success: false,
      userId: null,
      profile: null,
      error: 'Token 无效或已过期',
      errorCode: 'INVALID_TOKEN',
    }
  }

  const userId = data.user.id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, status')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return {
      success: false,
      userId,
      profile: null,
      error: '用户资料不存在',
      errorCode: 'PROFILE_NOT_FOUND',
    }
  }

  if (profile.status !== 'active') {
    return {
      success: false,
      userId,
      profile: profile as AdminProfile,
      error: '账号已被禁用',
      errorCode: 'ACCOUNT_DISABLED',
    }
  }

  if (profile.role !== 'admin') {
    return {
      success: false,
      userId,
      profile: profile as AdminProfile,
      error: '无管理员权限',
      errorCode: 'NOT_ADMIN',
    }
  }

  return {
    success: true,
    userId,
    profile: profile as AdminProfile,
    error: null,
    errorCode: null,
  }
}

export function getAuthErrorStatus(errorCode: AdminAuthErrorCode): number {
  switch (errorCode) {
    case 'UNAUTHORIZED':
    case 'INVALID_TOKEN':
      return 401
    case 'NOT_ADMIN':
    case 'ACCOUNT_DISABLED':
      return 403
    case 'PROFILE_NOT_FOUND':
      return 404
    default:
      return 500
  }
}

export function withAdminAuth(
  handler: (request: NextRequest, auth: AdminAuthResult) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const auth = await verifyAdminAuth(request)

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
          errorCode: auth.errorCode,
        },
        { status: getAuthErrorStatus(auth.errorCode!) }
      )
    }

    return handler(request, auth)
  }
}
