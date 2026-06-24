/**
 * 缓存项
 */
interface CacheItem<T> {
  value: T
  expiresAt: number
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  ttl: number  // 缓存时间（毫秒）
  key: string
}

/**
 * 内存缓存存储
 */
const cache = new Map<string, CacheItem<unknown>>()

/**
 * 缓存管理器
 */
export const CacheManager = {
  /**
   * 获取缓存值
   */
  get<T>(key: string): T | null {
    const item = cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      cache.delete(key)
      return null
    }

    return item.value as T
  },

  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, ttl: number = 60000): void {
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    })
  },

  /**
   * 删除缓存
   */
  invalidate(key: string): void {
    cache.delete(key)
  },

  /**
   * 按模式删除缓存
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    cache.clear()
  },

  /**
   * 获取缓存统计
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    }
  }
}

/**
 * 创建带缓存的数据获取函数
 * 
 * @param fetcher 数据获取函数
 * @param options 缓存选项
 * @returns 带缓存的获取函数
 */
export function withCache<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions
): () => Promise<T> {
  return async () => {
    // 尝试从缓存获取
    const cached = CacheManager.get<T>(options.key)
    if (cached !== null) {
      return cached
    }

    // 获取新数据
    const data = await fetcher()
    
    // 存入缓存
    CacheManager.set(options.key, data, options.ttl)
    
    return data
  }
}

/**
 * 缓存装饰器（用于类方法）
 */
export function Cached(options: CacheOptions) {
  return function <T>(
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${options.key}:${JSON.stringify(args)}`
      
      const cached = CacheManager.get<T>(cacheKey)
      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      CacheManager.set(cacheKey, result, options.ttl)
      
      return result
    }

    return descriptor
  }
}

/**
 * 常用缓存键
 */
export const CacheKeys = {
  DASHBOARD_STATS: 'admin:dashboard:stats',
  USER_LIST: 'admin:users:list',
  PRODUCT_LIST: 'admin:products:list',
  COURSE_LIST: 'admin:courses:list',
  CONTENT_LIST: 'admin:content:list',
  LOG_LIST: 'admin:logs:list'
}

/**
 * 默认 TTL 值（毫秒）
 */
export const DefaultTTL = {
  SHORT: 30 * 1000,      // 30 秒
  MEDIUM: 5 * 60 * 1000, // 5 分钟
  LONG: 30 * 60 * 1000   // 30 分钟
}

export default CacheManager
