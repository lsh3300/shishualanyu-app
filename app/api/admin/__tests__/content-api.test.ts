import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ReviewItem, ContentFilters } from '@/types/admin.types'
import type { ContentType, ReviewStatus } from '@/types/database'

// ============================================
// 辅助函数 - 模拟 API 逻辑
// ============================================

/**
 * 模拟内容筛选逻辑
 */
function filterContent(
  items: ReviewItem[],
  filters: ContentFilters
): ReviewItem[] {
  return items.filter(item => {
    // 类型过滤
    if (filters.type !== 'all' && item.content_type !== filters.type) {
      return false
    }

    // 状态过滤
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false
    }

    return true
  })
}

/**
 * 按创建时间排序（降序）
 */
function sortByCreatedAt(items: ReviewItem[]): ReviewItem[] {
  return [...items].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * 验证审核操作
 */
function validateReviewAction(
  action: 'approve' | 'reject',
  reason?: string
): { valid: boolean; error?: string } {
  if (action === 'reject' && !reason) {
    return { valid: false, error: '拒绝操作需要提供原因' }
  }
  return { valid: true }
}

/**
 * 获取审核后的状态
 */
function getReviewedStatus(action: 'approve' | 'reject'): ReviewStatus {
  return action === 'approve' ? 'approved' : 'rejected'
}

// ============================================
// 生成器
// ============================================

const contentTypeArb = fc.constantFrom<ContentType>('comment', 'work', 'report')
const reviewStatusArb = fc.constantFrom<ReviewStatus>('pending', 'approved', 'rejected')

// 使用固定格式的日期字符串生成器，避免 Invalid Date 问题
const dateStringArb = fc.integer({ min: 2020, max: 2030 }).chain(year =>
  fc.integer({ min: 1, max: 12 }).chain(month =>
    fc.integer({ min: 1, max: 28 }).map(day =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`
    )
  )
)

const submitterInfoArb = fc.record({
  id: fc.uuid(),
  username: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  avatar_url: fc.option(fc.webUrl(), { nil: null })
})

const reviewItemArb: fc.Arbitrary<ReviewItem> = fc.record({
  id: fc.uuid(),
  content_type: contentTypeArb,
  content_id: fc.uuid(),
  content_preview: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
  submitter: fc.option(submitterInfoArb, { nil: null }),
  status: reviewStatusArb,
  reject_reason: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
  created_at: dateStringArb,
  reviewed_at: fc.option(dateStringArb, { nil: null })
})

const contentFiltersArb: fc.Arbitrary<ContentFilters> = fc.record({
  type: fc.constantFrom<'all' | ContentType>('all', 'comment', 'work', 'report'),
  status: fc.constantFrom<'all' | ReviewStatus>('all', 'pending', 'approved', 'rejected')
})

// ============================================
// Property 7: 内容类型筛选正确性
// ============================================

describe('Property 7: 内容类型筛选正确性', () => {
  it('筛选后的内容都应满足类型条件', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 0, maxLength: 50 }),
        contentFiltersArb,
        (items, filters) => {
          const filtered = filterContent(items, filters)
          
          return filtered.every(item => {
            if (filters.type !== 'all' && item.content_type !== filters.type) {
              return false
            }
            if (filters.status !== 'all' && item.status !== filters.status) {
              return false
            }
            return true
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('筛选结果数量不应超过原始数量', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 0, maxLength: 50 }),
        contentFiltersArb,
        (items, filters) => {
          const filtered = filterContent(items, filters)
          return filtered.length <= items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('空筛选条件应返回所有内容', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 0, maxLength: 50 }),
        (items) => {
          const emptyFilters: ContentFilters = {
            type: 'all',
            status: 'all'
          }
          const filtered = filterContent(items, emptyFilters)
          return filtered.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('类型筛选应只返回指定类型的内容', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 1, maxLength: 50 }),
        contentTypeArb,
        (items, targetType) => {
          const filters: ContentFilters = {
            type: targetType,
            status: 'all'
          }
          const filtered = filterContent(items, filters)
          return filtered.every(item => item.content_type === targetType)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('状态筛选应只返回指定状态的内容', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 1, maxLength: 50 }),
        reviewStatusArb,
        (items, targetStatus) => {
          const filters: ContentFilters = {
            type: 'all',
            status: targetStatus
          }
          const filtered = filterContent(items, filters)
          return filtered.every(item => item.status === targetStatus)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 9: 内容排序正确性
// ============================================

describe('Property 9: 内容排序正确性', () => {
  it('排序后的内容应按创建时间降序排列', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 2, maxLength: 50 }),
        (items) => {
          const sorted = sortByCreatedAt(items)
          
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = new Date(sorted[i].created_at).getTime()
            const next = new Date(sorted[i + 1].created_at).getTime()
            if (current < next) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('排序不应改变内容数量', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 0, maxLength: 50 }),
        (items) => {
          const sorted = sortByCreatedAt(items)
          return sorted.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('排序后的内容ID集合应与原始相同', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 0, maxLength: 50 }),
        (items) => {
          const sorted = sortByCreatedAt(items)
          const originalIds = new Set(items.map(i => i.id))
          const sortedIds = new Set(sorted.map(i => i.id))
          
          if (originalIds.size !== sortedIds.size) return false
          for (const id of originalIds) {
            if (!sortedIds.has(id)) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 10: 审核操作状态更新
// ============================================

describe('Property 10: 审核操作状态更新', () => {
  it('通过操作应将状态设为approved', () => {
    fc.assert(
      fc.property(
        fc.constant('approve' as const),
        (action) => {
          const newStatus = getReviewedStatus(action)
          return newStatus === 'approved'
        }
      ),
      { numRuns: 10 }
    )
  })

  it('拒绝操作应将状态设为rejected', () => {
    fc.assert(
      fc.property(
        fc.constant('reject' as const),
        (action) => {
          const newStatus = getReviewedStatus(action)
          return newStatus === 'rejected'
        }
      ),
      { numRuns: 10 }
    )
  })

  it('拒绝操作必须提供原因', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
        (reason) => {
          const result = validateReviewAction('reject', reason)
          if (!reason) {
            return result.valid === false && result.error !== undefined
          }
          return result.valid === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('通过操作不需要原因', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
        (reason) => {
          const result = validateReviewAction('approve', reason)
          return result.valid === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('审核操作应返回有效状态', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'approve' | 'reject'>('approve', 'reject'),
        (action) => {
          const newStatus = getReviewedStatus(action)
          return ['approved', 'rejected'].includes(newStatus)
        }
      ),
      { numRuns: 20 }
    )
  })
})
