'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface FileCacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
}

interface FileCacheOptions {
  maxSize?: number; // 最大缓存项数
  maxAge?: number; // 缓存有效期（毫秒）
  enableCache?: boolean; // 是否启用缓存
}

interface UseFileCacheReturn {
  getFileUrl: (path: string, bucket?: string, isLocal?: boolean) => Promise<string>;
  preloadFile: (path: string, bucket?: string, isLocal?: boolean) => Promise<void>;
  clearCache: () => void;
  getCacheSize: () => number;
  isCached: (path: string, bucket?: string, isLocal?: boolean) => boolean;
  uploadFile: (file: File, bucket?: string, path?: string) => Promise<{ url: string; path: string } | null>;
  deleteFile: (path: string, bucket?: string, isLocal?: boolean) => Promise<boolean>;
}

export function useFileCache(options: FileCacheOptions = {}): UseFileCacheReturn {
  const {
    maxSize = 50,
    maxAge = 24 * 60 * 60 * 1000, // 24小时
    enableCache = true
  } = options;

  const [cache, setCache] = useState<Map<string, FileCacheItem>>(new Map());
  // 使用共享的supabase客户端实例，避免创建多个实例
  const supabaseClient = useMemo(() => supabase, []);

  // 生成缓存键
  const generateCacheKey = (path: string, bucket?: string, isLocal?: boolean): string => {
    return isLocal ? `local:${path}` : `${bucket}:${path}`;
  };

  // 清理过期缓存
  const cleanExpiredCache = () => {
    const now = Date.now();
    const updatedCache = new Map<string, FileCacheItem>();
    
    cache.forEach((item, key) => {
      if (now - item.timestamp < maxAge) {
        updatedCache.set(key, item);
      }
    });
    
    setCache(updatedCache);
  };

  // 限制缓存大小
  const limitCacheSize = () => {
    if (cache.size <= maxSize) return;
    
    // 按时间戳排序，删除最旧的项
    const sortedEntries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const updatedCache = new Map<string, FileCacheItem>();
    const entriesToKeep = sortedEntries.slice(-maxSize);
    
    entriesToKeep.forEach(([key, value]) => {
      updatedCache.set(key, value);
    });
    
    setCache(updatedCache);
  };

  // 获取文件URL
  const getFileUrl = async (path: string, bucket?: string, isLocal = false): Promise<string> => {
    const cacheKey = generateCacheKey(path, bucket, isLocal);
    
    // 检查缓存
    if (enableCache && cache.has(cacheKey)) {
      const cachedItem = cache.get(cacheKey)!;
      
      // 检查是否过期
      if (Date.now() - cachedItem.timestamp < maxAge) {
        return cachedItem.url;
      } else {
        // 删除过期项
        const updatedCache = new Map(cache);
        updatedCache.delete(cacheKey);
        setCache(updatedCache);
      }
    }
    
    // 获取新URL
    let url: string;
    
    if (isLocal) {
      // 本地文件URL
      url = `/local-storage/${path}`;
    } else if (bucket) {
      // Supabase文件URL
      const { data } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(path);
      
      url = data.publicUrl;
    } else {
      throw new Error('必须提供bucket参数或设置isLocal为true');
    }
    
    // 缓存URL
    if (enableCache) {
      cleanExpiredCache();
      
      const updatedCache = new Map(cache);
      updatedCache.set(cacheKey, {
        url,
        blob: new Blob(), // 空blob，仅用于缓存URL
        timestamp: Date.now()
      });
      
      setCache(updatedCache);
      limitCacheSize();
    }
    
    return url;
  };

  // 预加载文件
  const preloadFile = async (path: string, bucket?: string, isLocal = false): Promise<void> => {
    const cacheKey = generateCacheKey(path, bucket, isLocal);
    
    // 如果已缓存，跳过
    if (enableCache && cache.has(cacheKey)) {
      const cachedItem = cache.get(cacheKey)!;
      if (Date.now() - cachedItem.timestamp < maxAge) {
        return;
      }
    }
    
    try {
      let url: string;
      
      if (isLocal) {
        url = `/local-storage/${path}`;
      } else if (bucket) {
        const { data } = supabaseClient.storage
          .from(bucket)
          .getPublicUrl(path);
        
        url = data.publicUrl;
      } else {
        throw new Error('必须提供bucket参数或设置isLocal为true');
      }
      
      // 获取文件内容
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`获取文件失败: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 缓存文件
      if (enableCache) {
        cleanExpiredCache();
        
        const updatedCache = new Map(cache);
        updatedCache.set(cacheKey, {
          url,
          blob,
          timestamp: Date.now()
        });
        
        setCache(updatedCache);
        limitCacheSize();
      }
    } catch (error) {
      console.error('预加载文件失败:', error);
    }
  };

  // 清空缓存
  const clearCache = () => {
    setCache(new Map());
  };

  // 获取缓存大小
  const getCacheSize = (): number => {
    return cache.size;
  };

  // 检查是否已缓存
  const isCached = (path: string, bucket?: string, isLocal = false): boolean => {
    const cacheKey = generateCacheKey(path, bucket, isLocal);
    
    if (!cache.has(cacheKey)) {
      return false;
    }
    
    const cachedItem = cache.get(cacheKey)!;
    return Date.now() - cachedItem.timestamp < maxAge;
  };

  // 上传文件
  const uploadFile = async (file: File, bucket = 'uploads', path?: string): Promise<{ url: string; path: string } | null> => {
    try {
      // 生成文件路径
      const filePath = path || `${Date.now()}-${file.name}`;
      
      // 上传到Supabase
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('上传文件失败:', error);
        return null;
      }
      
      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return {
        url: urlData.publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('上传文件出错:', error);
      return null;
    }
  };

  // 删除文件
  const deleteFile = async (path: string, bucket = 'uploads', isLocal = false): Promise<boolean> => {
    try {
      if (isLocal) {
        // 本地文件删除逻辑（需要API支持）
        const response = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path }),
        });
        
        return response.ok;
      } else {
        // Supabase文件删除
        const { error } = await supabaseClient.storage
          .from(bucket)
          .remove([path]);
        
        if (error) {
          console.error('删除文件失败:', error);
          return false;
        }
        
        // 从缓存中移除
        const cacheKey = generateCacheKey(path, bucket, isLocal);
        const updatedCache = new Map(cache);
        updatedCache.delete(cacheKey);
        setCache(updatedCache);
        
        return true;
      }
    } catch (error) {
      console.error('删除文件出错:', error);
      return false;
    }
  };

  return {
    getFileUrl,
    preloadFile,
    clearCache,
    getCacheSize,
    isCached,
    uploadFile,
    deleteFile
  };
}