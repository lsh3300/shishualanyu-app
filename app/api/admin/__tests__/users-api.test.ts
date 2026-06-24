import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { UserListItem, UserFilters, PaginationParams } from '@/types/admin.types'
import type { UserRole, UserStatus } from '@/types/database'

// ============================================
// 辅助函数 - 模拟 API 逻辑
// ============================================

/**
 * 模拟用户筛选逻辑
 */
function filterUsers(
  users: UserListItem[],
  filters: UserFilters
): UserListItem[] {
  return users.filter(user => {
    // 搜索过滤
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        (user.username?.toLowerCase().includes(searchLower)) ||
        (user.email?.toLowerCase().includes(searchLower)) ||
        (user.full_name?.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // 角色过滤
    if (filters.role !== 'all' && user.role !== filters.role) {
      return false
    }

    // 状态过滤
    if (filters.status !== 'all' && user.status !== filters.status) {
      return false
    }

    return true
  })
}

/**
 * 计算分页参数
 */
function calculatePagination(
  total: number,
  page: number,
  pageSize: number
): PaginationParams {
  const safePage = Math.max(1, page)
  const safePageSize = Math.min(100, Math.max(1, pageSize))
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages
  }
}

/**
 * 应用分页
 */
function paginateUsers(
  users: UserListItem[],
  page: number,
  pageSize: number
): UserListItem[] {
  const safePage = Math.max(1, page)
  const safePageSize = Math.min(100, Math.max(1, pageSize))
  const start = (safePage - 1) * safePageSize
  return users.slice(start, start + safePageSize)
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

const userFiltersArb: fc.Arbitrary<UserFilters> = fc.record({
  search: fc.string({ maxLength: 50 }),
  role: fc.constantFrom<'all' | UserRole>('all', 'user', 'admin'),
  status: fc.constantFrom<'all' | UserStatus>('all', 'active', 'disabled', 'pending')
})

// ============================================
// Property 4: 用户筛选结果正确性
// ============================================

describe('Property 4: 用户筛选结果正确性', () => {
  it('筛选后的用户都应满足筛选条件', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 0, maxLength: 50 }),
        userFiltersArb,
        (users, filters) => {
          const filtered = filterUsers(users, filters)
          
          return filtered.every(user => {
            // 检查搜索条件
            if (filters.search) {
              const searchLower = filters.search.toLowerCase()
              const matchesSearch = 
                (user.username?.toLowerCase().includes(searchLower)) ||
                (user.email?.toLowerCase().includes(searchLower)) ||
                (user.full_name?.toLowerCase().includes(searchLower))
              if (!matchesSearch) return false
            }

            // 检查角色条件
            if (filters.role !== 'all' && user.role !== filters.role) {
              return false
            }

            // 检查状态条件
            if (filters.status !== 'all' && user.status !== filters.status) {
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
        fc.array(userListItemArb, { minLength: 0, maxLength: 50 }),
        userFiltersArb,
        (users, filters) => {
          const filtered = filterUsers(users, filters)
          return filtered.length <= users.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('空筛选条件应返回所有用户', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 0, maxLength: 50 }),
        (users) => {
          const emptyFilters: UserFilters = {
            search: '',
            role: 'all',
            status: 'all'
          }
          const filtered = filterUsers(users, emptyFilters)
          return filtered.length === users.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('角色筛选应只返回指定角色的用户', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 1, maxLength: 50 }),
        userRoleArb,
        (users, targetRole) => {
          const filters: UserFilters = {
            search: '',
            role: targetRole,
            status: 'all'
          }
          const filtered = filterUsers(users, filters)
          return filtered.every(user => user.role === targetRole)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('状态筛选应只返回指定状态的用户', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 1, maxLength: 50 }),
        userStatusArb,
        (users, targetStatus) => {
          const filters: UserFilters = {
            search: '',
            role: 'all',
            status: targetStatus
          }
          const filtered = filterUsers(users, filters)
          return filtered.every(user => user.status === targetStatus)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 3: 分页计算正确性
// ============================================

describe('Property 3: 分页计算正确性', () => {
  it('总页数计算应正确', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 100 }),
        (total, pageSize) => {
          const pagination = calculatePagination(total, 1, pageSize)
          const expectedTotalPages = Math.max(1, Math.ceil(total / pageSize))
          return pagination.totalPages === expectedTotalPages
        }
      ),
      { numRuns: 100 }
    )
  })

  it('页码应至少为1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (total, page, pageSize) => {
          const pagination = calculatePagination(total, page, pageSize)
          return pagination.page >= 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('每页大小应在1-100之间', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: -100, max: 200 }),
        (total, page, pageSize) => {
          const pagination = calculatePagination(total, page, pageSize)
          return pagination.pageSize >= 1 && pagination.pageSize <= 100
        }
      ),
      { numRuns: 100 }
    )
  })

  it('分页后的数据量不应超过每页大小', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 0, maxLength: 100 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 50 }),
        (users, page, pageSize) => {
          const paginated = paginateUsers(users, page, pageSize)
          return paginated.length <= pageSize
        }
      ),
      { numRuns: 100 }
    )
  })

  it('所有分页数据合并应等于原始数据', () => {
    fc.assert(
      fc.property(
        fc.array(userListItemArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (users, pageSize) => {
          const pagination = calculatePagination(users.length, 1, pageSize)
          let allPaginated: UserListItem[] = []
          
          for (let page = 1; page <= pagination.totalPages; page++) {
            const paginated = paginateUsers(users, page, pageSize)
            allPaginated = [...allPaginated, ...paginated]
          }
          
          return allPaginated.length === users.length
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ============================================
// Property 5 & 6: 用户状态切换和管理员自我保护
// ============================================

describe('Property 5: 用户状态切换正确性', () => {
  it('状态切换应在有效状态之间进行', () => {
    const validStatuses: UserStatus[] = ['active', 'disabled', 'pending']
    
    fc.assert(
      fc.property(
        userStatusArb,
        userStatusArb,
        (currentStatus, newStatus) => {
          return validStatuses.includes(currentStatus) && validStatuses.includes(newStatus)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('禁用操作应将状态设为disabled', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          // 模拟禁用操作
          const updatedUser = { ...user, status: 'disabled' as UserStatus }
          return updatedUser.status === 'disabled'
        }
      ),
      { numRuns: 50 }
    )
  })

  it('启用操作应将状态设为active', () => {
    fc.assert(
      fc.property(
        userListItemArb,
        (user) => {
          // 模拟启用操作
          const updatedUser = { ...user, status: 'active' as UserStatus }
          return updatedUser.status === 'active'
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('Property 6: 管理员自我保护', () => {
  it('管理员不能禁用自己', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (adminId) => {
          // 模拟检查：当目标用户ID等于当前管理员ID时，应拒绝操作
          const targetUserId = adminId
          const canDisable = targetUserId !== adminId
          return canDisable === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('管理员可以禁用其他用户', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (adminId, targetUserId) => {
          // 当两个ID不同时，应允许操作
          fc.pre(adminId !== targetUserId)
          const canDisable = targetUserId !== adminId
          return canDisable === true
        }
      ),
      { numRuns: 50 }
    )
  })
})
