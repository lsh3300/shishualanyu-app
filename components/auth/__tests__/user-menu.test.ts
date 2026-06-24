import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { UserRole, UserStatus } from '@/types/database'

// ============================================
// 辅助函数 - 模拟用户菜单逻辑
// ============================================

interface UserProfile {
  id: string
  role: UserRole
  status: UserStatus
}

/**
 * 检查用户是否为管理员
 */
function isAdmin(profile: UserProfile | null): boolean {
  return profile?.role === 'admin' && profile?.status === 'active'
}

/**
 * 检查是否应显示管理后台入口
 */
function shouldShowAdminEntry(profile: UserProfile | null): boolean {
  return isAdmin(profile)
}

/**
 * 获取菜单项列表
 */
function getMenuItems(profile: UserProfile | null): string[] {
  const baseItems = ['个人资料', '设置', '退出登录']
  
  if (shouldShowAdminEntry(profile)) {
    return ['管理后台', ...baseItems]
  }
  
  return baseItems
}

// ============================================
// 生成器
// ============================================

const userRoleArb = fc.constantFrom<UserRole>('user', 'admin')
const userStatusArb = fc.constantFrom<UserStatus>('active', 'disabled', 'pending')

const userProfileArb: fc.Arbitrary<UserProfile> = fc.record({
  id: fc.uuid(),
  role: userRoleArb,
  status: userStatusArb
})

// ============================================
// Property 12: 管理后台入口可见性
// ============================================

describe('Property 12: 管理后台入口可见性', () => {
  it('活跃管理员应看到管理后台入口', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const adminProfile: UserProfile = {
            id,
            role: 'admin',
            status: 'active'
          }
          return shouldShowAdminEntry(adminProfile) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('普通用户不应看到管理后台入口', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        userStatusArb,
        (id, status) => {
          const userProfile: UserProfile = {
            id,
            role: 'user',
            status
          }
          return shouldShowAdminEntry(userProfile) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('被禁用的管理员不应看到管理后台入口', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const disabledAdmin: UserProfile = {
            id,
            role: 'admin',
            status: 'disabled'
          }
          return shouldShowAdminEntry(disabledAdmin) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('待激活的管理员不应看到管理后台入口', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const pendingAdmin: UserProfile = {
            id,
            role: 'admin',
            status: 'pending'
          }
          return shouldShowAdminEntry(pendingAdmin) === false
        }
      ),
      { numRuns: 50 }
    )
  })

  it('未登录用户不应看到管理后台入口', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (profile) => {
          return shouldShowAdminEntry(profile) === false
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ============================================
// 菜单项测试
// ============================================

describe('用户菜单项', () => {
  it('所有用户都应看到基础菜单项', () => {
    fc.assert(
      fc.property(
        userProfileArb,
        (profile) => {
          const items = getMenuItems(profile)
          return items.includes('个人资料') &&
                 items.includes('设置') &&
                 items.includes('退出登录')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('管理员菜单应比普通用户多一项', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const adminProfile: UserProfile = { id, role: 'admin', status: 'active' }
          const userProfile: UserProfile = { id, role: 'user', status: 'active' }
          
          const adminItems = getMenuItems(adminProfile)
          const userItems = getMenuItems(userProfile)
          
          return adminItems.length === userItems.length + 1
        }
      ),
      { numRuns: 50 }
    )
  })

  it('管理后台入口应在菜单最前面', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const adminProfile: UserProfile = { id, role: 'admin', status: 'active' }
          const items = getMenuItems(adminProfile)
          return items[0] === '管理后台'
        }
      ),
      { numRuns: 50 }
    )
  })
})
