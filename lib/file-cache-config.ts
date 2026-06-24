// 文件缓存配置

// 缓存配置接口
export interface FileCacheConfig {
  // 是否启用缓存
  enabled: boolean;
  
  // 最大缓存大小（字节）
  maxSize: number;
  
  // 缓存过期时间（毫秒）
  expirationTime: number;
  
  // 是否预加载文件
  preload: boolean;
  
  // 预加载的文件类型
  preloadFileTypes: string[];
  
  // 是否使用Service Worker
  useServiceWorker: boolean;
  
  // 是否压缩缓存
  compress: boolean;
  
  // 缓存策略
  strategy: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  
  // 是否启用调试模式
  debug: boolean;
}

// 默认缓存配置
export const defaultCacheConfig: FileCacheConfig = {
  enabled: true,
  maxSize: 100 * 1024 * 1024, // 100MB
  expirationTime: 7 * 24 * 60 * 60 * 1000, // 7天
  preload: true,
  preloadFileTypes: ['image', 'video'],
  useServiceWorker: true,
  compress: false,
  strategy: 'cache-first',
  debug: false
};

// 文件类型配置
export interface FileTypeConfig {
  // 文件类型
  type: string;
  
  // MIME类型
  mimeTypes: string[];
  
  // 是否缓存
  cache: boolean;
  
  // 缓存策略
  cacheStrategy: FileCacheConfig['strategy'];
  
  // 预加载
  preload: boolean;
  
  // 最大文件大小（字节）
  maxSize: number;
  
  // 缩略图配置
  thumbnail: {
    enabled: boolean;
    width: number;
    height: number;
    quality: number;
  };
}

// 文件类型配置
export const fileTypeConfigs: Record<string, FileTypeConfig> = {
  image: {
    type: 'image',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    cache: true,
    cacheStrategy: 'cache-first',
    preload: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    thumbnail: {
      enabled: true,
      width: 200,
      height: 200,
      quality: 80
    }
  },
  video: {
    type: 'video',
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    cache: true,
    cacheStrategy: 'cache-first',
    preload: false,
    maxSize: 500 * 1024 * 1024, // 500MB
    thumbnail: {
      enabled: true,
      width: 200,
      height: 200,
      quality: 60
    }
  },
  audio: {
    type: 'audio',
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac'],
    cache: true,
    cacheStrategy: 'cache-first',
    preload: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    thumbnail: {
      enabled: false,
      width: 0,
      height: 0,
      quality: 0
    }
  },
  document: {
    type: 'document',
    mimeTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    cache: true,
    cacheStrategy: 'network-first',
    preload: false,
    maxSize: 20 * 1024 * 1024, // 20MB
    thumbnail: {
      enabled: false,
      width: 0,
      height: 0,
      quality: 0
    }
  },
  other: {
    type: 'other',
    mimeTypes: ['application/octet-stream'],
    cache: false,
    cacheStrategy: 'network-only',
    preload: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    thumbnail: {
      enabled: false,
      width: 0,
      height: 0,
      quality: 0
    }
  }
};

// 存储桶配置
export interface StorageBucketConfig {
  // 存储桶名称
  name: string;
  
  // 是否为本地存储
  isLocal: boolean;
  
  // 是否公开
  public: boolean;
  
  // 缓存配置
  cache: FileCacheConfig;
  
  // 允许的文件类型
  allowedFileTypes: string[];
  
  // 最大文件大小（字节）
  maxFileSize: number;
  
  // 是否生成缩略图
  generateThumbnails: boolean;
}

// 存储桶配置
export const storageBucketConfigs: Record<string, StorageBucketConfig> = {
  avatars: {
    name: 'avatars',
    isLocal: true,
    public: true,
    cache: {
      ...defaultCacheConfig,
      maxSize: 50 * 1024 * 1024, // 50MB
      preload: true,
      preloadFileTypes: ['image']
    },
    allowedFileTypes: ['image'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    generateThumbnails: true
  },
  courses: {
    name: 'courses',
    isLocal: true,
    public: true,
    cache: {
      ...defaultCacheConfig,
      maxSize: 200 * 1024 * 1024, // 200MB
      preload: true,
      preloadFileTypes: ['image', 'video']
    },
    allowedFileTypes: ['image', 'video'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    generateThumbnails: true
  },
  products: {
    name: 'products',
    isLocal: true,
    public: true,
    cache: {
      ...defaultCacheConfig,
      maxSize: 200 * 1024 * 1024, // 200MB
      preload: true,
      preloadFileTypes: ['image']
    },
    allowedFileTypes: ['image'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    generateThumbnails: true
  },
  temp: {
    name: 'temp',
    isLocal: true,
    public: false,
    cache: {
      ...defaultCacheConfig,
      maxSize: 100 * 1024 * 1024, // 100MB
      expirationTime: 24 * 60 * 60 * 1000, // 24小时
      preload: false
    },
    allowedFileTypes: ['image', 'video', 'audio', 'document'],
    maxFileSize: 200 * 1024 * 1024, // 200MB
    generateThumbnails: false
  },
  supabase: {
    name: 'supabase',
    isLocal: false,
    public: true,
    cache: {
      ...defaultCacheConfig,
      maxSize: 500 * 1024 * 1024, // 500MB
      preload: true,
      preloadFileTypes: ['image', 'video']
    },
    allowedFileTypes: ['image', 'video', 'audio', 'document'],
    maxFileSize: 500 * 1024 * 1024, // 500MB
    generateThumbnails: true
  }
};

// 获取文件类型配置
export function getFileTypeConfig(mimeType: string): FileTypeConfig {
  for (const config of Object.values(fileTypeConfigs)) {
    if (config.mimeTypes.includes(mimeType)) {
      return config;
    }
  }
  return fileTypeConfigs.other;
}

// 获取存储桶配置
export function getStorageBucketConfig(bucketName: string): StorageBucketConfig {
  return storageBucketConfigs[bucketName] || storageBucketConfigs.temp;
}

// 检查文件类型是否允许
export function isFileTypeAllowed(mimeType: string, bucketName: string): boolean {
  const bucketConfig = getStorageBucketConfig(bucketName);
  const fileTypeConfig = getFileTypeConfig(mimeType);
  return bucketConfig.allowedFileTypes.includes(fileTypeConfig.type);
}

// 检查文件大小是否允许
export function isFileSizeAllowed(size: number, bucketName: string): boolean {
  const bucketConfig = getStorageBucketConfig(bucketName);
  const fileTypeConfig = getFileTypeConfig('');
  const maxFileSize = Math.min(bucketConfig.maxFileSize, fileTypeConfig.maxSize);
  return size <= maxFileSize;
}

// 获取缓存配置
export function getCacheConfig(bucketName: string, mimeType: string): FileCacheConfig {
  const bucketConfig = getStorageBucketConfig(bucketName);
  const fileTypeConfig = getFileTypeConfig(mimeType);
  
  // 使用文件类型特定的缓存策略，如果没有则使用存储桶的默认策略
  return {
    ...bucketConfig.cache,
    strategy: fileTypeConfig.cacheStrategy || bucketConfig.cache.strategy
  };
}