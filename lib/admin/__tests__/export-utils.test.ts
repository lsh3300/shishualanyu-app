import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import { Formatters } from '../export-utils'

// Mock document 和 URL
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  
  // Mock DOM APIs
  global.document = {
    createElement: mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    }),
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    }
  } as unknown as Document
  
  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  } as unknown as typeof URL
  
  global.Blob = class Blob {
    constructor(public content: string[], public options: { type: string }) {}
  } as unknown as typeof Blob
})

describe('Export Utils', () => {
  describe('Formatters', () => {
    describe('date formatter', () => {
      it('should format valid dates', () => {
        const result = Formatters.date('2024-01-15')
        expect(result).toMatch(/2024/)
      })

      it('should return empty string for null/undefined', () => {
        expect(Formatters.date(null)).toBe('')
        expect(Formatters.date(undefined)).toBe('')
      })

      it('should return original value for invalid dates', () => {
        expect(Formatters.date('invalid')).toBe('invalid')
      })
    })

    describe('datetime formatter', () => {
      it('should format valid datetimes', () => {
        const result = Formatters.datetime('2024-01-15T10:30:00')
        expect(result).toMatch(/2024/)
      })

      it('should return empty string for null/undefined', () => {
        expect(Formatters.datetime(null)).toBe('')
        expect(Formatters.datetime(undefined)).toBe('')
      })
    })

    describe('currency formatter', () => {
      /**
       * Property 7: CSV 导出数据完整性 - 货币格式化
       */
      it('should format numbers as currency', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 100000, noNaN: true }),
            (value) => {
              const result = Formatters.currency(value)
              expect(result).toMatch(/^¥\d+\.\d{2}$/)
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should return empty string for null/undefined', () => {
        expect(Formatters.currency(null)).toBe('')
        expect(Formatters.currency(undefined)).toBe('')
      })

      it('should return original value for non-numbers', () => {
        expect(Formatters.currency('abc')).toBe('abc')
      })
    })

    describe('percent formatter', () => {
      it('should format numbers as percentages', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 1, noNaN: true }),
            (value) => {
              const result = Formatters.percent(value)
              expect(result).toMatch(/^\d+\.\d%$/)
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should return empty string for null/undefined', () => {
        expect(Formatters.percent(null)).toBe('')
        expect(Formatters.percent(undefined)).toBe('')
      })
    })

    describe('boolean formatter', () => {
      it('should format boolean values with default text', () => {
        const formatter = Formatters.boolean()
        expect(formatter(true)).toBe('是')
        expect(formatter(false)).toBe('否')
      })

      it('should format boolean values with custom text', () => {
        const formatter = Formatters.boolean('有库存', '无库存')
        expect(formatter(true)).toBe('有库存')
        expect(formatter(false)).toBe('无库存')
      })

      it('should handle truthy/falsy values', () => {
        const formatter = Formatters.boolean()
        expect(formatter(1)).toBe('是')
        expect(formatter(0)).toBe('否')
        expect(formatter('')).toBe('否')
        expect(formatter('text')).toBe('是')
      })
    })

    describe('enum formatter', () => {
      it('should map enum values', () => {
        const formatter = Formatters.enum({
          'active': '正常',
          'disabled': '已禁用'
        })
        
        expect(formatter('active')).toBe('正常')
        expect(formatter('disabled')).toBe('已禁用')
      })

      it('should return original value for unknown keys', () => {
        const formatter = Formatters.enum({
          'active': '正常'
        })
        
        expect(formatter('unknown')).toBe('unknown')
      })
    })
  })

  describe('Property Tests - CSV 导出数据完整性', () => {
    /**
     * Property: 格式化器应该总是返回字符串
     */
    it('formatters should always return strings', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (value) => {
            const dateResult = Formatters.date(value)
            const datetimeResult = Formatters.datetime(value)
            const currencyResult = Formatters.currency(value)
            const percentResult = Formatters.percent(value)
            const boolResult = Formatters.boolean()(value)
            
            expect(typeof dateResult).toBe('string')
            expect(typeof datetimeResult).toBe('string')
            expect(typeof currencyResult).toBe('string')
            expect(typeof percentResult).toBe('string')
            expect(typeof boolResult).toBe('string')
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 货币格式化应该保留两位小数
     */
    it('currency formatter should have exactly 2 decimal places for valid numbers', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100000, noNaN: true }),
          (value) => {
            const result = Formatters.currency(value)
            const match = result.match(/\.(\d+)$/)
            if (match) {
              expect(match[1].length).toBe(2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 百分比格式化应该保留一位小数
     */
    it('percent formatter should have exactly 1 decimal place for valid numbers', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          (value) => {
            const result = Formatters.percent(value)
            const match = result.match(/\.(\d+)%$/)
            if (match) {
              expect(match[1].length).toBe(1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
