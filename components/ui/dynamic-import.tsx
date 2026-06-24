"use client"

import React, { useState, useEffect, ComponentType } from "react"

// 动态导入组件的接口
interface DynamicImportProps {
  loader: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  delay?: number
  error?: React.ReactNode
  children?: (props: { Component: ComponentType<any> }) => React.ReactNode
}

// 动态导入组件
export function DynamicImport({
  loader,
  fallback = <div className="flex justify-center p-4">加载中...</div>,
  delay = 200,
  error = <div className="text-red-500 p-4">加载失败，请重试</div>,
  children
}: DynamicImportProps) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // 延迟加载
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!shouldLoad) return

    const loadComponent = async () => {
      try {
        setLoading(true)
        const module = await loader()
        setComponent(() => module.default)
        setLoadError(null)
      } catch (err) {
        setLoadError(err as Error)
        console.error("动态导入失败:", err)
      } finally {
        setLoading(false)
      }
    }

    loadComponent()
  }, [loader, shouldLoad])

  if (loadError) {
    return <>{error}</>
  }

  if (loading || !Component) {
    return <>{fallback}</>
  }

  if (children) {
    return <>{children({ Component })}</>
  }

  return <Component />
}

// 视口内动态导入
export function DynamicImportOnIntersection({
  loader,
  fallback = <div className="flex justify-center p-4">加载中...</div>,
  rootMargin = "100px",
  children
}: Omit<DynamicImportProps, "delay"> & { rootMargin?: string }) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, rootMargin])

  return (
    <div ref={setRef}>
      {shouldLoad ? (
        <DynamicImport loader={loader} fallback={fallback}>
          {children}
        </DynamicImport>
      ) : (
        <>{fallback}</>
      )}
    </div>
  )
}

// 用户交互后动态导入
export function DynamicImportOnInteraction({
  loader,
  fallback = <div className="flex justify-center p-4">点击加载</div>,
  trigger = "click",
  children
}: Omit<DynamicImportProps, "delay"> & { 
  trigger?: "click" | "hover" | "focus"
}) {
  const [shouldLoad, setShouldLoad] = useState(false)

  const handleInteraction = () => {
    if (!shouldLoad) {
      setShouldLoad(true)
    }
  }

  const eventHandlers = {
    click: trigger === "click" ? { onClick: handleInteraction } : {},
    hover: trigger === "hover" ? { onMouseEnter: handleInteraction } : {},
    focus: trigger === "focus" ? { onFocus: handleInteraction } : {},
  }

  return (
    <div {...eventHandlers.click} {...eventHandlers.hover} {...eventHandlers.focus}>
      {shouldLoad ? (
        <DynamicImport loader={loader} fallback={fallback}>
          {children}
        </DynamicImport>
      ) : (
        <>{fallback}</>
      )}
    </div>
  )
}

// 预加载组件
export function PreloadComponent({
  loader,
  when = "idle"
}: {
  loader: () => Promise<{ default: ComponentType<any> }>
  when?: "idle" | "visible" | "load"
}) {
  useEffect(() => {
    const preload = () => {
      // 静默预加载，不渲染组件
      loader().catch(err => {
        console.warn("组件预加载失败:", err)
      })
    }

    if (when === "idle") {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(preload)
      } else {
        setTimeout(preload, 100)
      }
    } else if (when === "load") {
      window.addEventListener("load", preload, { once: true })
      return () => window.removeEventListener("load", preload)
    } else if (when === "visible") {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(preload)
      } else {
        setTimeout(preload, 100)
      }
    }
  }, [loader, when])

  return null
}

// 批量预加载
export function BatchPreload({
  loaders
}: {
  loaders: Array<{ loader: () => Promise<{ default: ComponentType<any> }>, priority?: number }>
}) {
  useEffect(() => {
    const sortedLoaders = [...loaders].sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    const preloadBatch = (batch: Array<{ loader: () => Promise<{ default: ComponentType<any> }> }>) => {
      return Promise.allSettled(
        batch.map(({ loader }) => 
          loader().catch(err => {
            console.warn("组件预加载失败:", err)
            return null
          })
        )
      )
    }

    // 高优先级组件立即预加载
    const highPriority = sortedLoaders.filter(l => (l.priority || 0) >= 8)
    if (highPriority.length > 0) {
      preloadBatch(highPriority)
    }

    // 中优先级组件在空闲时预加载
    const mediumPriority = sortedLoaders.filter(l => (l.priority || 0) >= 4 && (l.priority || 0) < 8)
    if (mediumPriority.length > 0) {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => preloadBatch(mediumPriority))
      } else {
        setTimeout(() => preloadBatch(mediumPriority), 200)
      }
    }

    // 低优先级组件在页面加载完成后预加载
    const lowPriority = sortedLoaders.filter(l => (l.priority || 0) < 4)
    if (lowPriority.length > 0) {
      const handleLoad = () => {
        setTimeout(() => preloadBatch(lowPriority), 1000)
      }
      window.addEventListener("load", handleLoad, { once: true })
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [loaders])

  return null
}