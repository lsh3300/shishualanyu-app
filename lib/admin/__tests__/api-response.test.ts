import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  calculatePagination,
  parsePaginationParams,
  ErrorResponses,
  type PaginationInfo
} from '../api-response'

describe('API Response Utils', () => {
  describe('successResponse', () => {
    /**
     * Property 1: 成功响应必须包含 success: true 和 data 字段
     */
    it('should always include success: true and data field', async () => {
      await fc.assert(
        fc.asyncProperty(
          // 使用 JSON 可序列化的数据类型
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.array(fc.string()),
            fc.dictionary(fc.string(), fc.string())
          ),
          fc.option(fc.string(), { nil: undefined }),
          async (data, message) => {
            const response = successResponse(data, message)
            const json = await response.json()
            
            expect(json.success).toBe(true)
            expect(json).toHaveProperty('data')
            // JSON 序列化后比较
            expect(JSON.stringify(json.data)).toEqual(JSON.stringify(data))
            
            if (message) {
              expect(json.message).toBe(message)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 2: 成功响应默认状态码为 200
     */
    it('should have default status 200', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (data) => {
            const response = successResponse(data)
            expect(response.status).toBe(200)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 3: 可以自定义状态码（排除 204/205 等无 body 状态码）
     */
    it('should allow custom status codes', () => {
      fc.assert(
        fc.property(
          fc.string(),
          // 排除 204 No Content 和 205 Reset Content 等不能有 body 的状态码
          fc.constantFrom(200, 201, 202, 203, 206, 207, 208, 226),
          (data, status) => {
            const response = successResponse(data, undefined, status)
            expect(response.status).toBe(status)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('errorResponse', () => {
    /**
     * Property 4: 错误响应必须包含 success: false 和 error 字段
     */
    it('should always include success: false and error field', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 400, max: 599 }),
          fc.option(fc.string(), { nil: undefined }),
          async (errorMsg, status, errorCode) => {
            const response = errorResponse(errorMsg, status, errorCode)
            const json = await response.json()
            
            expect(json.success).toBe(false)
            expect(json.error).toBe(errorMsg)
            expect(response.status).toBe(status)
            
            if (errorCode) {
              expect(json.errorCode).toBe(errorCode)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 5: 错误响应默认状态码为 500
     */
    it('should have default status 500', async () => {
      const response = errorResponse('Test error')
      expect(response.status).toBe(500)
    })

    /**
     * Property 6: 错误信息非空性
     */
    it('should always have non-empty error message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (errorMsg) => {
            const response = errorResponse(errorMsg)
            const json = await response.json()
            
            expect(json.error).toBeTruthy()
            expect(json.error.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('paginatedResponse', () => {
    /**
     * Property 7: 分页响应必须包含 items 和 pagination 字段
     */
    it('should include items and pagination in data', async () => {
      await fc.assert(
        fc.asyncProperty(
          // 使用 JSON 可序列化的数据
          fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean())),
          fc.record({
            page: fc.integer({ min: 1, max: 1000 }),
            pageSize: fc.integer({ min: 1, max: 100 }),
            total: fc.integer({ min: 0, max: 100000 }),
            totalPages: fc.integer({ min: 0, max: 10000 })
          }),
          async (items, pagination) => {
            const response = paginatedResponse(items, pagination as PaginationInfo)
            const json = await response.json()
            
            expect(json.success).toBe(true)
            expect(json.data).toHaveProperty('items')
            expect(json.data).toHaveProperty('pagination')
            expect(JSON.stringify(json.data.items)).toEqual(JSON.stringify(items))
            expect(json.data.pagination).toEqual(pagination)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('calculatePagination', () => {
    /**
     * Property 8: 分页计算正确性 - totalPages = ceil(total / pageSize)
     */
    it('should calculate totalPages correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 100000 }),
          (page, pageSize, total) => {
            const pagination = calculatePagination(page, pageSize, total)
            
            expect(pagination.page).toBe(page)
            expect(pagination.pageSize).toBe(pageSize)
            expect(pagination.total).toBe(total)
            expect(pagination.totalPages).toBe(Math.ceil(total / pageSize))
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 9: 空数据时 totalPages 为 0
     */
    it('should return 0 totalPages for empty data', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          (page, pageSize) => {
            const pagination = calculatePagination(page, pageSize, 0)
            expect(pagination.totalPages).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('parsePaginationParams', () => {
    /**
     * Property 10: 解析的页码必须 >= 1
     */
    it('should ensure page is at least 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          (pageInput) => {
            const params = new URLSearchParams()
            params.set('page', String(pageInput))
            
            const result = parsePaginationParams(params)
            expect(result.page).toBeGreaterThanOrEqual(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 11: 解析的 pageSize 必须在 1 到 maxPageSize 之间
     */
    it('should ensure pageSize is within bounds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 500 }),
          fc.integer({ min: 10, max: 200 }),
          (pageSizeInput, maxPageSize) => {
            const params = new URLSearchParams()
            params.set('pageSize', String(pageSizeInput))
            
            const result = parsePaginationParams(params, { maxPageSize })
            expect(result.pageSize).toBeGreaterThanOrEqual(1)
            expect(result.pageSize).toBeLessThanOrEqual(maxPageSize)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 12: from 和 to 计算正确性
     */
    it('should calculate from and to correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 50 }),
          (page, pageSize) => {
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('pageSize', String(pageSize))
            
            const result = parsePaginationParams(params)
            
            expect(result.from).toBe((page - 1) * pageSize)
            expect(result.to).toBe(result.from + pageSize - 1)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property 13: 使用默认值
     */
    it('should use default values when params not provided', () => {
      const params = new URLSearchParams()
      const result = parsePaginationParams(params, { page: 5, pageSize: 30 })
      
      expect(result.page).toBe(5)
      expect(result.pageSize).toBe(30)
    })
  })

  describe('ErrorResponses shortcuts', () => {
    /**
     * Property 14: 所有快捷方法返回正确的状态码
     */
    it('should return correct status codes', () => {
      expect(ErrorResponses.unauthorized().status).toBe(401)
      expect(ErrorResponses.forbidden().status).toBe(403)
      expect(ErrorResponses.notFound().status).toBe(404)
      expect(ErrorResponses.badRequest().status).toBe(400)
      expect(ErrorResponses.serverError().status).toBe(500)
      expect(ErrorResponses.databaseError().status).toBe(500)
    })

    /**
     * Property 15: 所有快捷方法返回正确的错误代码
     */
    it('should return correct error codes', async () => {
      const responses = [
        { response: ErrorResponses.unauthorized(), code: 'UNAUTHORIZED' },
        { response: ErrorResponses.forbidden(), code: 'FORBIDDEN' },
        { response: ErrorResponses.notFound(), code: 'NOT_FOUND' },
        { response: ErrorResponses.badRequest(), code: 'INVALID_PARAMS' },
        { response: ErrorResponses.serverError(), code: 'INTERNAL_ERROR' },
        { response: ErrorResponses.databaseError(), code: 'DATABASE_ERROR' }
      ]

      for (const { response, code } of responses) {
        const json = await response.json()
        expect(json.errorCode).toBe(code)
      }
    })

    /**
     * Property 16: 自定义错误消息
     */
    it('should allow custom error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (customMessage) => {
            const response = ErrorResponses.unauthorized(customMessage)
            const json = await response.json()
            expect(json.error).toBe(customMessage)
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
