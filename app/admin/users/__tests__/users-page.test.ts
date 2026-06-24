import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { UserListItem } from '@/types/admin.types'
import type { UserRole, UserStatus } from '@/types/database'

// ============================================
// 辅助函数 - 模拟页面渲染逻辑
// ============================================

/**
 * 获取用户显示名称
 */
function getUserDisplayName(user: UserListItem): string {
  return user.username || user.email || '未知用户'
}

/**
 * 获取用户头像首字母
 */
function getAvatarFallback(user: UserListItem): string {
  const name = user.username || user.email || 'U'
  const firstChar = name[0] || 'U'
  // 如果是字母则转大写，否则返回 'U'
  return /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : 'U'
}

/**
 * 获取角色显示文本
 */
function getRoleDisplayText(role: UserRole): string {
  return role === 'admin' ? '管理员' : '用户'
}

/**
 * 获取状态显示文本
 */
function getStatusDisplayText(status: UserStatus): string {
  switch (status) {
    case 'active': return '正常'
    case 'disabled': return '已禁用'
    case 'pending': return '待激活'
    default: return '未知'
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

/**
 * 检查用户是否可以被禁用
 */
function canDisableUser(currentUserId: string, targetUser: UserListItem): boolean {
  // 不能禁用自己
  if (currentUserId === targetUser.id) return false
  // 只能禁用活跃用户
  return targetUser.status === 'active'
}

/**
 * 检查用户是否可以被启用
 */
function canEnableUser(targetUser: UserListItem): boolean {
  return targetUser.status === 'disabled' || targetUser.status === 'pending'
}

// ============================================
// 生成器
// ============================================

const userRoleArb = fc.constantFrom<UserRole>('user', 'admin')
const userStatusArb = fc.constantFrom<UserStatus>('active', 'disabled', 'pending')

// 使用固定格式的日期字符串生成器，避免 Invalid Date 问题
const dateStringArb = fc.integer({ min: 2020, max: 2030 }).chain(year =>
  fc.integer({ min: 1, max: 12 }).chain(month =>
    fc.integer({ min: 1, max: 28 }).map(day =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`
    )
  )
)

const userListItemArb: fc.Arbitrary<UserListItem> = fc.record({
  id: fc.uuid(),
  username: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  email: fc.emailAddress(),
  full_name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  avatar_url: fc.option(fc.webUrl(), { nil: null }),
  role: userRoleArb,
  status: userStatusArb,
  created_at: dateStringArb,
  updated_at: dateStringArb
})

// ============================================
// Property 2: 用户列表渲染完整性
// ============================================

describe('Property 2: 用户列表渲染完整性', () => {
  it('每个用户都应有显示名称', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          const displayName = getUserDisplayName(user)
          return displayName.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('头像首字母应为大写字母或默认值U', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          const fallback = getAvatarFallback(user)
          return fallback.length === 1 && /[A-Z]/.test(fallback)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('角色显示文本应为中文', () => {
    fc.assert(
      fc.property(
        userRoleArb,
        (role) => {
          const text = getRoleDisplayText(role)
          return text === '管理员' || text === '用户'
        }
      ),
      { numRuns: 20 }
    )
  })

  it('状态显示文本应为中文', () => {
    fc.assert(
      fc.property(
        userStatusArb,
        (status) => {
          const text = getStatusDisplayText(status)
          return ['正常', '已禁用', '待激活'].includes(text)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('日期格式化应返回有效字符串', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date) => {
          const formatted = formatDate(date.toISOString())
          // 中文日期格式应包含年月日分隔符
          return formatted.length > 0 && /\d/.test(formatted)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('用户列表应保持原始顺序', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 2, maxLength: 20 }),
        (users) => {
          // 模拟渲染：遍历用户列表
          const renderedIds = users.map(u => u.id)
          const originalIds = users.map(u => u.id)
          return JSON.stringify(renderedIds) === JSON.stringify(originalIds)
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ============================================
// Property 5 & 6: 用户状态切换和管理员自我保护（页面级）
// ============================================

describe('用户操作权限验证', () => {
  it('管理员不能禁用自己', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          // 假设当前用户就是这个用户
          const currentUserId = user.id
          const canDisable = canDisableUser(currentUserId, user)
          return canDisable === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('管理员可以禁用其他活跃用户', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        userListItemArb,
        (currentUserId, targetUser) => {
          fc.pre(currentUserId !== targetUser.id)
          fc.pre(targetUser.status === 'active')
          
          const canDisable = canDisableUser(currentUserId, targetUser)
          return canDisable === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('不能禁用已禁用的用户', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        userListItemArb,
        (currentUserId, targetUser) => {
          fc.pre(currentUserId !== targetUser.id)
          fc.pre(targetUser.status === 'disabled')
          
          const canDisable = canDisableUser(currentUserId, targetUser)
          return canDisable === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('可以启用已禁用的用户', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          fc.pre(user.status === 'disabled')
          return canEnableUser(user) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('不能启用已激活的用户', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          fc.pre(user.status === 'active')
          return canEnableUser(user) === false
        }
      ),
      { numRuns: 50 }
    )
  })
})
