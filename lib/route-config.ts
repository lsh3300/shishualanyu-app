// 路由级代码分割配置
// 用于优化不同页面的加载策略

import React, { ComponentType } from 'react'

// 路由优先级枚举
export enum RoutePriority {
  CRITICAL = 10,    // 首屏关键路由
  HIGH = 8,         // 高优先级路由
  MEDIUM = 5,       // 中等优先级路由
  LOW = 3,          // 低优先级路由
  LAZY = 1          // 懒加载路由
}

// 路由配置接口
export interface RouteConfig {
  path: string
  priority: RoutePriority
  preload?: boolean
  prefetch?: boolean
  chunkName?: string
}

// 路由配置表
export const routeConfigs: RouteConfig[] = [
  // 首屏关键路由
  {
    path: "/",
    priority: RoutePriority.CRITICAL,
    preload: true,
    chunkName: "home"
  },
  
  // 高优先级路由
  {
    path: "/teaching",
    priority: RoutePriority.HIGH,
    preload: true,
    chunkName: "teaching"
  },
  {
    path: "/store",
    priority: RoutePriority.HIGH,
    preload: true,
    chunkName: "store"
  },
  
  // 中等优先级路由
  {
    path: "/cart",
    priority: RoutePriority.MEDIUM,
    prefetch: true,
    chunkName: "cart"
  },
  {
    path: "/profile",
    priority: RoutePriority.MEDIUM,
    prefetch: true,
    chunkName: "profile"
  },
  
  // 低优先级路由
  {
    path: "/messages",
    priority: RoutePriority.LOW,
    chunkName: "messages"
  },
  {
    path: "/notifications",
    priority: RoutePriority.LOW,
    chunkName: "notifications"
  },
  {
    path: "/culture",
    priority: RoutePriority.LOW,
    chunkName: "culture"
  },
  
  // 懒加载路由
  {
    path: "/checkout",
    priority: RoutePriority.LAZY,
    chunkName: "checkout"
  },
  {
    path: "/teaching/[id]",
    priority: RoutePriority.LAZY,
    chunkName: "course-detail"
  },
  {
    path: "/store/custom",
    priority: RoutePriority.LAZY,
    chunkName: "custom-product"
  },
  {
    path: "/store/[id]",
    priority: RoutePriority.LAZY,
    chunkName: "product-detail"
  }
]

// 根据路径获取路由配置
export function getRouteConfig(path: string): RouteConfig | undefined {
  // 精确匹配
  const exactMatch = routeConfigs.find(config => config.path === path)
  if (exactMatch) return exactMatch
  
  // 模式匹配 (用于动态路由)
  const patternMatch = routeConfigs.find(config => {
    if (!config.path.includes('[')) return false
    
    // 将动态路由模式转换为正则表达式
    const pattern = config.path
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace(/\//g, '\\/')
    
    const regex = new RegExp(`^${pattern}$`)
    return regex.test(path)
  })
  
  return patternMatch
}

// 获取需要预加载的路由
export function getPreloadRoutes(): RouteConfig[] {
  return routeConfigs.filter(config => config.preload)
}

// 获取需要预获取的路由
export function getPrefetchRoutes(): RouteConfig[] {
  return routeConfigs.filter(config => config.prefetch)
}

// 获取路由优先级
export function getRoutePriority(path: string): RoutePriority {
  const config = getRouteConfig(path)
  return config ? config.priority : RoutePriority.MEDIUM
}

// 路由级动态导入函数
export function createRouteLoader(path: string) {
  const config = getRouteConfig(path)
  
  // 根据路径返回对应的动态导入函数
  const routeLoaders: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
    "/": () => import("@/app/page"),
    "/teaching": () => import("@/app/teaching/page"),
    "/store": () => import("@/app/store/page"),
    "/cart": () => import("@/app/cart/page"),
    "/profile": () => import("@/app/profile/page"),
    "/messages": () => import("@/app/messages/page"),
    "/notifications": () => import("@/app/notifications/page"),
    "/culture": () => import("@/app/culture/page"),
    "/checkout": () => import("@/app/checkout/page"),
    "/teaching/[id]": () => import("@/app/teaching/[id]/page"),
    "/store/custom": () => import("@/app/store/custom/page"),
    "/store/[id]": () => import("@/app/store/[id]/page")
  }
  
  const loader = routeLoaders[path]
  if (!loader) {
    console.warn(`未找到路径 ${path} 的加载器`)
    return () => Promise.resolve({ default: () => React.createElement('div', null, '页面未找到') })
  }
  
  return loader
}

// 预加载指定路由
export async function preloadRoute(path: string): Promise<void> {
  const loader = createRouteLoader(path)
  try {
    await loader()
  } catch (error) {
    console.warn(`预加载路由 ${path} 失败:`, error)
  }
}

// 批量预加载路由
export async function preloadRoutes(paths: string[]): Promise<void> {
  const promises = paths.map(path => preloadRoute(path))
  await Promise.allSettled(promises)
}

// 预加载高优先级路由
export async function preloadHighPriorityRoutes(): Promise<void> {
  const highPriorityRoutes = getPreloadRoutes()
  await preloadRoutes(highPriorityRoutes.map(config => config.path))
}

// 预获取指定路由 (低优先级)
export function prefetchRoute(path: string): void {
  const config = getRouteConfig(path)
  if (!config || !config.prefetch) return
  
  // 使用 link 预获取
  const link = document.createElement("link")
  link.rel = "prefetch"
  link.href = path
  document.head.appendChild(link)
}

// 批量预获取路由
export function prefetchRoutes(): void {
  const prefetchRoutes = getPrefetchRoutes()
  prefetchRoutes.forEach(config => {
    prefetchRoute(config.path)
  })
}