import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import { 
  verifyAdminAuth, 
  withAdminAuth, 
  getAuthErrorStatus,
  type AdminAuthErrorCode 
} from '../auth-middleware'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}))

// 创建模拟请求
function createMockRequest(authHeader?: string): NextRequest {
  const headers = new Headers()
  if (authHeader) {
    headers.set('Authorization', authHeader)
  }
  return new NextRequest('http://localhost/api/admin/test', { headers })
}

// 创建有效的 JWT token（模拟）
function createMockJwt(userId: string, expired = false): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const exp = expired ? Math.floor(Date.now() / 1000) - 3600 : Math.floor(Date.now() / 1000) + 3600
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp })).toString('base64')
  const signature = 'mock_signature'
  return `${header}.${payload}.${signature}`
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuthErrorStatus', () => {
    it('should return correct status codes for all error types', () => {
      const errorStatusMap: Record<AdminAuthErrorCode, number> = {
        'UNAUTHORIZED': 401,
        'INVALID_TOKEN': 401,
        'NOT_ADMIN': 403,
        'ACCOUNT_DISABLED': 403,
        'PROFILE_NOT_FOUND': 404
      }

      for (const [errorCode, expectedStatus] of Object.entries(errorStatusMap)) {
        expect(getAuthErrorStatus(errorCode as AdminAuthErrorCode)).toBe(expectedStatus)
      }
    })
  })

  describe('Property Tests - 权限验证一致性', () => {
    /**
     * Property 1: 无 Authorization header 时必须返回 UNAUTHORIZED
     */
    it('should always return UNAUTHORIZED when no auth header', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), // 任意 URL 路径
          async () => {
            const request = createMockRequest()
            const result = await verifyAdminAuth(request)
            
            expect(result.success).toBe(false)
            expect(result.errorCode).toBe('UNAUTHORIZED')
            expect(result.userId).toBeNull()
            expect(result.profile).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 2: 无效的 Authorization header 格式必须返回 UNAUTHORIZED
     */
    it('should return UNAUTHORIZED for invalid auth header format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => !s.startsWith('Bearer ')),
          async (invalidHeader) => {
            const request = createMockRequest(invalidHeader)
            const result = await verifyAdminAuth(request)
            
            expect(result.success).toBe(false)
            expect(result.errorCode).toBe('UNAUTHORIZED')
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 3: 过期的 token 必须返回 INVALID_TOKEN
     */
    it('should return INVALID_TOKEN for expired tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (userId) => {
            const expiredToken = createMockJwt(userId, true)
            const request = createMockRequest(`Bearer ${expiredToken}`)
            
            // Mock Supabase 返回错误
            const { createServiceClient } = await import('@/lib/supabaseClient')
            vi.mocked(createServiceClient).mockReturnValue({
              auth: {
                getUser: vi.fn().mockResolvedValue({ data: null, error: new Error('Token expired') })
              },
              from: vi.fn()
            } as any)
            
            const result = await verifyAdminAuth(request)
            
            expect(result.success).toBe(false)
            expect(result.errorCode).toBe('INVALID_TOKEN')
          }
        ),
        { numRuns: 50 }
      )
    })

    /**
     * Property 4: 错误状态码映射一致性
     */
    it('should map error codes to correct HTTP status consistently', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<AdminAuthErrorCode>(
            'UNAUTHORIZED', 
            'INVALID_TOKEN', 
            'PROFILE_NOT_FOUND', 
            'NOT_ADMIN', 
            'ACCOUNT_DISABLED'
          ),
          (errorCode) => {
            const status = getAuthErrorStatus(errorCode)
            
            // 验证状态码在有效范围内
            expect(status).toBeGreaterThanOrEqual(400)
            expect(status).toBeLessThan(600)
            
            // 验证特定映射
            if (errorCode === 'UNAUTHORIZED' || errorCode === 'INVALID_TOKEN') {
              expect(status).toBe(401)
            }
            if (errorCode === 'NOT_ADMIN' || errorCode === 'ACCOUNT_DISABLED') {
              expect(status).toBe(403)
            }
            if (errorCode === 'PROFILE_NOT_FOUND') {
              expect(status).toBe(404)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('withAdminAuth wrapper', () => {
    it('should call handler when auth succeeds', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: 'test' }))
      )
      
      const wrappedHandler = withAdminAuth(mockHandler)
      
      // 创建有效请求
      const validToken = createMockJwt('test-user-id')
      const request = createMockRequest(`Bearer ${validToken}`)
      
      // Mock 成功的验证
      const { createServiceClient } = await import('@/lib/supabaseClient')
      vi.mocked(createServiceClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { 
                  id: 'test-user-id', 
                  role: 'admin', 
                  status: 'active',
                  username: 'admin',
                  full_name: 'Admin User',
                  avatar_url: null
                },
                error: null
              })
            }))
          }))
        }))
      } as any)
      
      await wrappedHandler(request)
      
      // Handler 应该被调用
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should return error response when auth fails', async () => {
      const mockHandler = vi.fn()
      const wrappedHandler = withAdminAuth(mockHandler)
      
      // 无 auth header 的请求
      const request = createMockRequest()
      
      const response = await wrappedHandler(request)
      const data = await response.json()
      
      expect(data.success).toBe(false)
      expect(data.errorCode).toBe('UNAUTHORIZED')
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})
