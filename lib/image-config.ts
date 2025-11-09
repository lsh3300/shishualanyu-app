// 图片压缩配置
export const imageConfig = {
  // 图片格式配置
  formats: {
    // 支持的图片格式
    supported: ['image/webp', 'image/jpeg', 'image/png', 'image/avif'],
    // 优先使用AVIF格式（如果浏览器支持）
    preferred: 'image/avif',
    // 备用格式
    fallback: 'image/webp',
  },
  
  // 图片质量配置
  quality: {
    // JPEG质量 (0-100)
    jpeg: 85,
    // WebP质量 (0-100)
    webp: 85,
    // PNG压缩级别 (0-9)
    png: 8,
  },
  
  // 图片尺寸限制
  sizes: {
    // 缩略图最大尺寸
    thumbnail: {
      width: 200,
      height: 200,
    },
    // 卡片图片最大尺寸
    card: {
      width: 400,
      height: 300,
    },
    // 详情页图片最大尺寸
    detail: {
      width: 800,
      height: 600,
    },
    // 全屏图片最大尺寸
    fullscreen: {
      width: 1920,
      height: 1080,
    },
  },
  
  // 懒加载配置
  lazyLoading: {
    // 提前加载距离（像素）
    rootMargin: '100px',
    // 预加载图片数量
    preloadCount: 2,
  },
  
  // 响应式图片断点
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
}

// 根据用途获取图片尺寸配置
export function getImageConfigByUsage(usage: 'thumbnail' | 'card' | 'detail' | 'fullscreen') {
  return imageConfig.sizes[usage]
}

// 根据屏幕宽度生成响应式图片srcSet
export function generateSrcSet(baseUrl: string, usage: 'thumbnail' | 'card' | 'detail' | 'fullscreen') {
  const config = getImageConfigByUsage(usage)
  const { breakpoints } = imageConfig
  
  // 生成不同尺寸的图片URL
  const sizes = Object.entries(breakpoints).map(([key, width]) => {
    const height = Math.round((width * config.height) / config.width)
    return `${baseUrl}?w=${width}&h=${height}&format=webp&q=${imageConfig.quality.webp} ${width}w`
  })
  
  return sizes.join(', ')
}

// 生成sizes属性
export function generateSizes(usage: 'thumbnail' | 'card' | 'detail' | 'fullscreen') {
  switch (usage) {
    case 'thumbnail':
      return '(max-width: 640px) 100px, 200px'
    case 'card':
      return '(max-width: 640px) 300px, (max-width: 768px) 350px, 400px'
    case 'detail':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px'
    case 'fullscreen':
      return '100vw'
    default:
      return '100vw'
  }
}