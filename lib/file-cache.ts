import { createClient } from '@/lib/supabase/client';

// 文件缓存服务类
export class FileCacheService {
  private supabase = createClient();
  private cachePrefix = 'file_cache_';
  private cacheExpiry = 60 * 60 * 24 * 7; // 7天（秒）

  // 获取缓存键
  private getCacheKey(path: string): string {
    return `${this.cachePrefix}${path}`;
  }

  // 设置缓存
  async setCache(path: string, url: string, isLocal: boolean = false): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(path);
      const cacheData = {
        url,
        isLocal,
        timestamp: Date.now(),
        expiresAt: Date.now() + (this.cacheExpiry * 1000)
      };
      
      // 存储到localStorage
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // 如果是远程文件，预加载到浏览器缓存
      if (!isLocal) {
        await this.preloadFile(url);
      }
    } catch (error) {
      console.error('设置文件缓存失败:', error);
    }
  }

  // 获取缓存
  async getCache(path: string): Promise<{ url: string; isLocal: boolean } | null> {
    try {
      const cacheKey = this.getCacheKey(path);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const cache = JSON.parse(cachedData);
      
      // 检查缓存是否过期
      if (Date.now() > cache.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return {
        url: cache.url,
        isLocal: cache.isLocal
      };
    } catch (error) {
      console.error('获取文件缓存失败:', error);
      return null;
    }
  }

  // 删除缓存
  deleteCache(path: string): void {
    try {
      const cacheKey = this.getCacheKey(path);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('删除文件缓存失败:', error);
    }
  }

  // 清理所有过期缓存
  cleanExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          try {
            const cache = JSON.parse(localStorage.getItem(key) || '{}');
            
            if (Date.now() > cache.expiresAt) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (e) {
            // 如果解析失败，直接删除该项
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });
      
      console.log(`清理了 ${cleanedCount} 个过期缓存项`);
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  }

  // 清理所有缓存
  clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });
      
      console.log(`清理了 ${cleanedCount} 个缓存项`);
    } catch (error) {
      console.error('清理所有缓存失败:', error);
    }
  }

  // 获取缓存大小（估算）
  getCacheSize(): number {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      });
      
      return totalSize;
    } catch (error) {
      console.error('获取缓存大小失败:', error);
      return 0;
    }
  }

  // 预加载文件到浏览器缓存
  private async preloadFile(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`预加载文件失败: ${url}`));
      
      document.head.appendChild(link);
      
      // 一段时间后移除link元素
      setTimeout(() => {
        document.head.removeChild(link);
      }, 5000);
    });
  }

  // 获取文件URL（优先从缓存获取）
  async getFileUrl(path: string, isLocal: boolean = false): Promise<string> {
    // 先尝试从缓存获取
    const cached = await this.getCache(path);
    if (cached) {
      return cached.url;
    }
    
    // 缓存中没有，从API获取
    try {
      const response = await fetch('/api/files/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path, isLocal })
      });
      
      if (!response.ok) {
        throw new Error('获取文件URL失败');
      }
      
      const data = await response.json();
      const url = data.url;
      
      // 设置缓存
      await this.setCache(path, url, isLocal);
      
      return url;
    } catch (error) {
      console.error('获取文件URL失败:', error);
      throw error;
    }
  }

  // 批量获取文件URL
  async getBatchFileUrls(
    files: Array<{ path: string; isLocal?: boolean }>
  ): Promise<Array<{ path: string; url: string; isLocal: boolean }>> {
    const results = [];
    
    for (const file of files) {
      try {
        const url = await this.getFileUrl(file.path, file.isLocal || false);
        results.push({
          path: file.path,
          url,
          isLocal: file.isLocal || false
        });
      } catch (error) {
        console.error(`获取文件URL失败: ${file.path}`, error);
        results.push({
          path: file.path,
          url: '',
          isLocal: file.isLocal || false
        });
      }
    }
    
    return results;
  }

  // 预加载多个文件
  async preloadFiles(
    files: Array<{ path: string; isLocal?: boolean }>
  ): Promise<void> {
    const urls = await this.getBatchFileUrls(files);
    
    // 并行预加载所有文件
    const preloadPromises = urls
      .filter(item => !item.isLocal && item.url) // 只预加载远程文件
      .map(item => this.preloadFile(item.url));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log(`预加载了 ${preloadPromises.length} 个文件`);
    } catch (error) {
      console.error('预加载文件失败:', error);
    }
  }

  // 获取缓存统计信息
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    expiredItems: number;
    validItems: number;
  } {
    try {
      const keys = Object.keys(localStorage);
      let totalItems = 0;
      let totalSize = 0;
      let expiredItems = 0;
      let validItems = 0;
      
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          totalItems++;
          const value = localStorage.getItem(key);
          
          if (value) {
            totalSize += value.length;
            
            try {
              const cache = JSON.parse(value);
              if (Date.now() > cache.expiresAt) {
                expiredItems++;
              } else {
                validItems++;
              }
            } catch (e) {
              expiredItems++;
            }
          }
        }
      });
      
      return {
        totalItems,
        totalSize,
        expiredItems,
        validItems
      };
    } catch (error) {
      console.error('获取缓存统计信息失败:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        expiredItems: 0,
        validItems: 0
      };
    }
  }

  // 初始化缓存服务
  init(): void {
    // 清理过期缓存
    this.cleanExpiredCache();
    
    // 监听存储事件，处理跨标签页的缓存更新
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.cachePrefix)) {
        // 如果缓存被其他标签页删除，则清理本地状态
        if (e.newValue === null) {
          console.log('缓存被其他标签页清理:', e.key);
        }
      }
    });
    
    // 监听页面卸载事件，执行清理操作
    window.addEventListener('beforeunload', () => {
      // 可以在这里执行一些清理操作
      // 但要注意不要在beforeunload中执行耗时操作
    });
    
    console.log('文件缓存服务已初始化');
  }
}

// 创建单例实例
export const fileCacheService = new FileCacheService();

// 初始化缓存服务
if (typeof window !== 'undefined') {
  fileCacheService.init();
}