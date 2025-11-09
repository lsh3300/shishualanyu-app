"use client"

import React, { useEffect, useRef, useState } from "react"

// 性能指标接口
interface PerformanceMetrics {
  route: string
  loadTime: number
  componentCount: number
  bundleSize?: number
  timestamp: number
}

// 组件加载时间接口
interface ComponentLoadTime {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

// 性能监控类
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private componentLoadTimes: ComponentLoadTime[] = []
  private observers: PerformanceObserver[] = []

  // 开始监控组件加载
  startComponentLoad(name: string): void {
    this.componentLoadTimes.push({
      name,
      startTime: performance.now()
    })
  }

  // 结束监控组件加载
  endComponentLoad(name: string): number | undefined {
    const component = this.componentLoadTimes.find(c => c.name === name && !c.endTime)
    if (!component) return undefined

    component.endTime = performance.now()
    component.duration = component.endTime - component.startTime

    return component.duration
  }

  // 获取组件加载时间
  getComponentLoadTime(name: string): number | undefined {
    const component = this.componentLoadTimes.find(c => c.name === name && c.duration)
    return component?.duration
  }

  // 记录路由加载性能
  recordRouteLoad(route: string, componentCount: number): void {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart

    this.metrics.push({
      route,
      loadTime,
      componentCount,
      timestamp: Date.now()
    })
  }

  // 获取路由加载性能
  getRouteMetrics(route?: string): PerformanceMetrics[] {
    if (route) {
      return this.metrics.filter(m => m.route === route)
    }
    return this.metrics
  }

  // 监控资源加载
  observeResourceLoading(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === "resource") {
          const resource = entry as PerformanceResourceTiming
          // 只监控 JavaScript 资源
          if (resource.name.endsWith(".js")) {
            console.log(`资源加载: ${resource.name.split("/").pop()}, 耗时: ${resource.duration}ms`)
          }
        }
      })
    })

    observer.observe({ entryTypes: ["resource"] })
    this.observers.push(observer)
  }

  // 监控长任务
  observeLongTasks(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === "longtask") {
          console.warn(`长任务检测: 持续时间 ${entry.duration}ms`)
        }
      })
    })

    observer.observe({ entryTypes: ["longtask"] })
    this.observers.push(observer)
  }

  // 监控首次内容绘制和最大内容绘制
  observePaintTiming(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === "paint") {
          console.log(`绘制时间: ${entry.name}, 时间点: ${entry.startTime}ms`)
        }
      })
    })

    observer.observe({ entryTypes: ["paint"] })
    this.observers.push(observer)
  }

  // 获取Web Vitals指标
  getWebVitals(): {
    FCP?: number
    LCP?: number
    CLS?: number
    FID?: number
  } {
    const vitals: any = {}

    // First Contentful Paint (FCP)
    const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0] as PerformanceEntry
    if (fcpEntry) {
      vitals.FCP = fcpEntry.startTime
    }

    // Largest Contentful Paint (LCP)
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint")
    if (lcpEntries.length > 0) {
      vitals.LCP = lcpEntries[lcpEntries.length - 1].startTime
    }

    // Cumulative Layout Shift (CLS)
    const clsEntries = performance.getEntriesByType("layout-shift") as any[]
    if (clsEntries.length > 0) {
      vitals.CLS = clsEntries.reduce((sum, entry) => sum + entry.value, 0)
    }

    // First Input Delay (FID)
    const fidEntries = performance.getEntriesByType("first-input") as any[]
    if (fidEntries.length > 0) {
      vitals.FID = fidEntries[0].processingStart - fidEntries[0].startTime
    }

    return vitals
  }

  // 清理观察器
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  // 导出性能数据
  exportData(): string {
    const data = {
      metrics: this.metrics,
      componentLoadTimes: this.componentLoadTimes.filter(c => c.duration !== undefined),
      webVitals: this.getWebVitals()
    }
    
    return JSON.stringify(data, null, 2)
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 性能监控Hook
export function usePerformanceMonitor(route: string, componentCount: number = 0) {
  const routeRef = useRef(route)
  const componentCountRef = useRef(componentCount)

  useEffect(() => {
    routeRef.current = route
    componentCountRef.current = componentCount
    
    // 记录路由加载性能
    performanceMonitor.recordRouteLoad(route, componentCount)
    
    // 开始监控资源加载
    performanceMonitor.observeResourceLoading()
    
    // 开始监控长任务
    performanceMonitor.observeLongTasks()
    
    // 开始监控绘制时间
    performanceMonitor.observePaintTiming()
    
    // 清理函数
    return () => {
      performanceMonitor.disconnect()
    }
  }, [route, componentCount])
}

// 组件性能监控Hook
export function useComponentPerformance(name: string) {
  useEffect(() => {
    // 开始监控
    performanceMonitor.startComponentLoad(name)
    
    // 组件卸载时结束监控
    return () => {
      performanceMonitor.endComponentLoad(name)
    }
  }, [name])
}

// 性能报告组件
export function PerformanceReport() {
  const [report, setReport] = useState<string>("")
  const [isVisible, setIsVisible] = useState(false)

  const generateReport = () => {
    const data = performanceMonitor.exportData()
    setReport(data)
    setIsVisible(true)
  }

  const closeReport = () => {
    setIsVisible(false)
  }

  // 只在开发环境显示
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <>
      <button
        onClick={generateReport}
        className="fixed bottom-20 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg"
        title="生成性能报告"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">性能报告</h2>
              <button
                onClick={closeReport}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {report}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}