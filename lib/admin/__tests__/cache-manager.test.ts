import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import { CacheManager, withCache, CacheKeys, DefaultTTL } from '../cache-manager'

describe('CacheManager', () => {
  beforeEach(() => {
    CacheManager.clear()
  })

  describe('基础功能', () => {
    it('should set and get values', () => {
      CacheManager.set('test-key', 'test-value')
      expect(CacheManager.get('test-key')).toBe('test-value')
    })

    it('should return null for non-existent keys', () => {
      expect(CacheManager.get('non-existent')).toBeNull()
    })

    it('should invalidate specific key', () => {
      CacheManager.set('key1', 'value1')
      CacheManager.set('key2', 'value2')
      
      CacheManager.invalidate('key1')
      
      expect(CacheManager.get('key1')).toBeNull()
      expect(CacheManager.get('key2')).toBe('value2')
    })

    it('should invalidate by pattern', () => {
      CacheManager.set('admin:users:1', 'user1')
      CacheManager.set('admin:users:2', 'user2')
      CacheManager.set('admin:products:1', 'product1')
      
      CacheManager.invalidatePattern('admin:users:*')
      
      expect(CacheManager.get('admin:users:1')).toBeNull()
      expect(CacheManager.get('admin:users:2')).toBeNull()
      expect(CacheManager.get('admin:products:1')).toBe('product1')
    })

    it('should clear all cache', () => {
      CacheManager.set('key1', 'value1')
      CacheManager.set('key2', 'value2')
      
      CacheManager.clear()
      
      expect(CacheManager.get('key1')).toBeNull()
      expect(CacheManager.get('key2')).toBeNull()
    })

    it('should return stats', () => {
      CacheManager.set('key1', 'value1')
      CacheManager.set('key2', 'value2')
      
      const stats = CacheManager.stats()
      
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
    })
  })

  describe('Property Tests - 缓存一致性', () => {
    /**
     * Property 10: 缓存一致性 - 在 TTL 内重复请求应返回缓存数据
     */
    it('should return cached value within TTL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.anything().filter(v => v !== undefined && v !== null),
          (key, value) => {
            CacheManager.clear()
            CacheManager.set(key, value, 60000) // 60 秒 TTL
            
            // 立即获取应该返回缓存值
            const cached = CacheManager.get(key)
            expect(cached).toEqual(value)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 过期后应返回 null
     */
    it('should return null after TTL expires', async () => {
      vi.useFakeTimers()
      
      CacheManager.set('expire-test', 'value', 100) // 100ms TTL
      
      // 立即获取
      expect(CacheManager.get('expire-test')).toBe('value')
      
      // 前进 150ms
      vi.advanceTimersByTime(150)
      
      // 过期后应返回 null
      expect(CacheManager.get('expire-test')).toBeNull()
      
      vi.useRealTimers()
    })

    /**
     * Property: 设置新值应覆盖旧值
     */
    it('should overwrite existing values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string(),
          fc.string(),
          (key, value1, value2) => {
            CacheManager.clear()
            CacheManager.set(key, value1)
            CacheManager.set(key, value2)
            
            expect(CacheManager.get(key)).toBe(value2)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Property: 不同 key 的值应该独立
     */
    it('should keep values independent for different keys', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }).filter(s => s !== ''),
          fc.string(),
          fc.string(),
          (key1, key2Suffix, value1, value2) => {
            const key2 = key1 + key2Suffix // 确保 key2 不同于 key1
            CacheManager.clear()
            
            CacheManager.set(key1, value1)
            CacheManager.set(key2, value2)
            
            expect(CacheManager.get(key1)).toBe(value1)
            expect(CacheManager.get(key2)).toBe(value2)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('withCache', () => {
    it('should cache fetcher results', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched-data')
      
      const cachedFetcher = withCache(fetcher, {
        key: 'test-cache',
        ttl: 60000
      })
      
      // 第一次调用
      const result1 = await cachedFetcher()
      expect(result1).toBe('fetched-data')
      expect(fetcher).toHaveBeenCalledTimes(1)
      
      // 第二次调用应该使用缓存
      const result2 = await cachedFetcher()
      expect(result2).toBe('fetched-data')
      expect(fetcher).toHaveBeenCalledTimes(1) // 仍然是 1 次
    })

    it('should refetch after cache expires', async () => {
      vi.useFakeTimers()
      
      const fetcher = vi.fn().mockResolvedValue('fetched-data')
      
      const cachedFetcher = withCache(fetcher, {
        key: 'expire-cache',
        ttl: 100
      })
      
      // 第一次调用
      await cachedFetcher()
      expect(fetcher).toHaveBeenCalledTimes(1)
      
      // 前进 150ms
      vi.advanceTimersByTime(150)
      
      // 缓存过期后应该重新获取
      await cachedFetcher()
      expect(fetcher).toHaveBeenCalledTimes(2)
      
      vi.useRealTimers()
    })
  })

  describe('CacheKeys and DefaultTTL', () => {
    it('should have predefined cache keys', () => {
      expect(CacheKeys.DASHBOARD_STATS).toBe('admin:dashboard:stats')
      expect(CacheKeys.USER_LIST).toBe('admin:users:list')
      expect(CacheKeys.PRODUCT_LIST).toBe('admin:products:list')
      expect(CacheKeys.COURSE_LIST).toBe('admin:courses:list')
    })

    it('should have predefined TTL values', () => {
      expect(DefaultTTL.SHORT).toBe(30 * 1000)
      expect(DefaultTTL.MEDIUM).toBe(5 * 60 * 1000)
      expect(DefaultTTL.LONG).toBe(30 * 60 * 1000)
    })
  })
})
