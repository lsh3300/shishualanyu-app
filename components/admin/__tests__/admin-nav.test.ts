/**
 * Feature: admin-dashboard, Property 11: 导航高亮一致性
 * Validates: Requirements 9.3
 * 
 * 测试导航菜单高亮逻辑的正确性
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isNavItemActive, getActiveNavItem, defaultNavItems } from '../admin-nav'

// 导航项 href 生成器
const navHrefArbitrary = fc.constantFrom(
  '/admin',
  '/admin/users',
  '/admin/content-review',
  '/admin/products',
  '/admin/courses',
  '/admin/logs'
)

// 路径后缀生成器（用于生成子路由）
const pathSuffixArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('/edit'),
  fc.constant('/new'),
  fc.constant('/123'),
  fc.constant('/settings')
)

describe('Admin Nav - Property Tests', () => {
  /**
   * Property 11: 导航高亮一致性
   * 
   * For any 导航项点击，当前路由应与点击的导航项对应，且该导航项应处于高亮状态
   */
  describe('Property 11: 导航高亮一致性', () => {
    it('/admin 路由应只匹配仪表盘导航项', () => {
      fc.assert(
        fc.property(
          fc.constant('/admin'),
          (pathname) => {
            // /admin 应该匹配仪表盘
            expect(isNavItemActive(pathname, '/admin')).toBe(true)
            
            // /admin 不应该匹配其他导航项
            expect(isNavItemActive(pathname, '/admin/users')).toBe(false)
            expect(isNavItemActive(pathname, '/admin/content-review')).toBe(false)
            expect(isNavItemActive(pathname, '/admin/products')).toBe(false)
            expect(isNavItemActive(pathname, '/admin/courses')).toBe(false)
            expect(isNavItemActive(pathname, '/admin/logs')).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('子路由应匹配对应的父导航项', () => {
      fc.assert(
        fc.property(
          navHrefArbitrary.filter(href => href !== '/admin'),
          pathSuffixArbitrary,
          (baseHref, suffix) => {
            const pathname = baseHref + suffix
            
            // 应该匹配对应的导航项
            expect(isNavItemActive(pathname, baseHref)).toBe(true)
            
            // 不应该匹配仪表盘（除非是 /admin 本身）
            if (pathname !== '/admin') {
              expect(isNavItemActive(pathname, '/admin')).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('对于任意有效路径，应有且仅有一个导航项被激活', () => {
      fc.assert(
        fc.property(
          navHrefArbitrary,
          pathSuffixArbitrary,
          (baseHref, suffix) => {
            // 仪表盘不添加后缀
            const pathname = baseHref === '/admin' ? '/admin' : baseHref + suffix
            
            // 计算激活的导航项数量
            const activeCount = defaultNavItems.filter(item => 
              isNavItemActive(pathname, item.href)
            ).length

            // 应该有且仅有一个导航项被激活
            expect(activeCount).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getActiveNavItem 应返回正确的活动导航项', () => {
      fc.assert(
        fc.property(
          navHrefArbitrary,
          pathSuffixArbitrary,
          (baseHref, suffix) => {
            // 仪表盘不添加后缀
            const pathname = baseHref === '/admin' ? '/admin' : baseHref + suffix
            
            const activeItem = getActiveNavItem(pathname)
            
            // 应该返回一个导航项
            expect(activeItem).not.toBeNull()
            
            // 返回的导航项应该与路径匹配
            if (activeItem) {
              expect(isNavItemActive(pathname, activeItem.href)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('不同导航项的路由不应相互匹配', () => {
      fc.assert(
        fc.property(
          navHrefArbitrary.filter(href => href !== '/admin'),
          navHrefArbitrary.filter(href => href !== '/admin'),
          (href1, href2) => {
            // 如果两个 href 不同
            if (href1 !== href2) {
              // href1 的路由不应该匹配 href2
              expect(isNavItemActive(href1, href2)).toBe(false)
              expect(isNavItemActive(href2, href1)).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

describe('Admin Nav - Unit Tests', () => {
  describe('isNavItemActive', () => {
    it('应正确匹配 /admin 路由', () => {
      expect(isNavItemActive('/admin', '/admin')).toBe(true)
      expect(isNavItemActive('/admin/', '/admin')).toBe(false)
    })

    it('应正确匹配用户管理路由', () => {
      expect(isNavItemActive('/admin/users', '/admin/users')).toBe(true)
      expect(isNavItemActive('/admin/users/123', '/admin/users')).toBe(true)
      expect(isNavItemActive('/admin/users/edit', '/admin/users')).toBe(true)
    })

    it('应正确匹配内容审核路由', () => {
      expect(isNavItemActive('/admin/content-review', '/admin/content-review')).toBe(true)
      expect(isNavItemActive('/admin/content-review/123', '/admin/content-review')).toBe(true)
    })

    it('应正确匹配产品管理路由', () => {
      expect(isNavItemActive('/admin/products', '/admin/products')).toBe(true)
      expect(isNavItemActive('/admin/products/new', '/admin/products')).toBe(true)
    })

    it('应正确匹配课程管理路由', () => {
      expect(isNavItemActive('/admin/courses', '/admin/courses')).toBe(true)
      expect(isNavItemActive('/admin/courses/edit/1', '/admin/courses')).toBe(true)
    })

    it('应正确匹配操作日志路由', () => {
      expect(isNavItemActive('/admin/logs', '/admin/logs')).toBe(true)
    })

    it('不应错误匹配不相关的路由', () => {
      expect(isNavItemActive('/admin/users', '/admin/content-review')).toBe(false)
      expect(isNavItemActive('/admin/product-management', '/admin/users')).toBe(false)
    })
  })

  describe('getActiveNavItem', () => {
    it('应返回仪表盘导航项', () => {
      const item = getActiveNavItem('/admin')
      expect(item?.href).toBe('/admin')
      expect(item?.title).toBe('仪表盘')
    })

    it('应返回用户管理导航项', () => {
      const item = getActiveNavItem('/admin/users')
      expect(item?.href).toBe('/admin/users')
      expect(item?.title).toBe('用户管理')
    })

    it('应返回内容审核导航项', () => {
      const item = getActiveNavItem('/admin/content-review')
      expect(item?.href).toBe('/admin/content-review')
      expect(item?.title).toBe('内容审核')
    })

    it('对于子路由应返回父导航项', () => {
      const item = getActiveNavItem('/admin/users/123/edit')
      expect(item?.href).toBe('/admin/users')
    })

    it('对于未知路由应返回 null', () => {
      const item = getActiveNavItem('/admin/unknown')
      expect(item).toBeNull()
    })
  })
})
