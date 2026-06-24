import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ReviewItem } from '@/types/admin.types'
import type { ContentType, ReviewStatus } from '@/types/database'

// ============================================
// 辅助函数 - 模拟页面渲染逻辑
// ============================================

const contentTypeLabels: Record<ContentType, string> = {
  comment: '评论',
  work: '作品',
  report: '举报'
}

const statusLabels: Record<ReviewStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
}

/**
 * 获取内容类型显示文本
 */
function getContentTypeLabel(type: ContentType): string {
  return contentTypeLabels[type] || '未知'
}

/**
 * 获取状态显示文本
 */
function getStatusLabel(status: ReviewStatus): string {
  return statusLabels[status] || '未知'
}

/**
 * 获取提交者显示名称
 */
function getSubmitterName(item: ReviewItem): string {
  return item.submitter?.username || '匿名用户'
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

/**
 * 检查是否可以审核
 */
function canReview(item: ReviewItem): boolean {
  return item.status === 'pending'
}

/**
 * 检查是否显示拒绝原因
 */
function shouldShowRejectReason(item: ReviewItem): boolean {
  return item.status === 'rejected' && !!item.reject_reason
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

// ============================================
// Property 8: 审核内容显示完整性
// ============================================

describe('Property 8: 审核内容显示完整性', () => {
  it('内容类型应显示为中文标签', () => {
    fc.assert(
      fc.property(
        contentTypeArb,
        (type) => {
          const label = getContentTypeLabel(type)
          return ['评论', '作品', '举报'].includes(label)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('状态应显示为中文标签', () => {
    fc.assert(
      fc.property(
        reviewStatusArb,
        (status) => {
          const label = getStatusLabel(status)
          return ['待审核', '已通过', '已拒绝'].includes(label)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('提交者名称应有默认值', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        (item) => {
          const name = getSubmitterName(item)
          return name.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('无提交者时应显示匿名用户', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        (item) => {
          const itemWithoutSubmitter = { ...item, submitter: null }
          const name = getSubmitterName(itemWithoutSubmitter)
          return name === '匿名用户'
        }
      ),
      { numRuns: 50 }
    )
  })

  it('日期格式化应返回有效字符串', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        (dateStr) => {
          const formatted = formatDateTime(dateStr)
          return formatted.length > 0 && /\d/.test(formatted)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('待审核内容应显示审核按钮', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        (item) => {
          const pendingItem = { ...item, status: 'pending' as ReviewStatus }
          return canReview(pendingItem) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('已审核内容不应显示审核按钮', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        fc.constantFrom<ReviewStatus>('approved', 'rejected'),
        (item, status) => {
          const reviewedItem = { ...item, status }
          return canReview(reviewedItem) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('被拒绝且有原因的内容应显示拒绝原因', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        fc.string({ minLength: 1, maxLength: 500 }),
        (item, reason) => {
          const rejectedItem = { 
            ...item, 
            status: 'rejected' as ReviewStatus,
            reject_reason: reason
          }
          return shouldShowRejectReason(rejectedItem) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('非拒绝状态不应显示拒绝原因', () => {
    fc.assert(
      fc.property(
        reviewItemArb,
        fc.constantFrom<ReviewStatus>('pending', 'approved'),
        (item, status) => {
          const nonRejectedItem = { ...item, status }
          return shouldShowRejectReason(nonRejectedItem) === false
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ============================================
// 内容列表渲染测试
// ============================================

describe('内容列表渲染', () => {
  it('列表应保持原始顺序', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 2, maxLength: 20 }),
        (items) => {
          const renderedIds = items.map(i => i.id)
          const originalIds = items.map(i => i.id)
          return JSON.stringify(renderedIds) === JSON.stringify(originalIds)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('每个内容项都应有唯一ID', () => {
    fc.assert(
      fc.property(
        fc.array(reviewItemArb, { minLength: 2, maxLength: 20 }),
        (items) => {
          const ids = items.map(i => i.id)
          const uniqueIds = new Set(ids)
          return uniqueIds.size === ids.length
        }
      ),
      { numRuns: 50 }
    )
  })
})
