import * as React from 'react'

// 定义断点常量
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

// 设备类型枚举
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

// 响应式断点配置
export const breakpoints = {
  sm: 640,
  md: MOBILE_BREAKPOINT,
  lg: TABLET_BREAKPOINT,
  xl: DESKTOP_BREAKPOINT,
  '2xl': 1536,
}

// 媒体查询辅助函数
function createMediaQuery(maxWidth: number) {
  return `(max-width: ${maxWidth - 1}px)`
}

function createMediaQueryRange(minWidth: number, maxWidth: number) {
  return `(min-width: ${minWidth}px) and (max-width: ${maxWidth - 1}px)`
}

function createMediaQueryMin(minWidth: number) {
  return `(min-width: ${minWidth}px)`
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(createMediaQuery(MOBILE_BREAKPOINT))
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // 使用现代API或回退方案
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      // 兼容旧版浏览器
      mql.addListener(onChange)
    }
    
    // 初始化状态
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return !!isMobile
}

// 检测是否为平板设备
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(createMediaQueryRange(MOBILE_BREAKPOINT, TABLET_BREAKPOINT))
    const onChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      mql.addListener(onChange)
    }
    
    const width = window.innerWidth
    setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return !!isTablet
}

// 检测是否为桌面设备
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(createMediaQueryMin(TABLET_BREAKPOINT))
    const onChange = () => {
      setIsDesktop(window.innerWidth >= TABLET_BREAKPOINT)
    }
    
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      mql.addListener(onChange)
    }
    
    setIsDesktop(window.innerWidth >= TABLET_BREAKPOINT)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return !!isDesktop
}

// 获取当前设备类型
export function useDeviceType(): DeviceType {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  
  if (isMobile) return DeviceType.MOBILE
  if (isTablet) return DeviceType.TABLET
  if (isDesktop) return DeviceType.DESKTOP
  
  // 默认返回桌面类型
  return DeviceType.DESKTOP
}

// 获取当前屏幕宽度
export function useScreenWidth() {
  const [width, setWidth] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    const onChange = () => {
      setWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', onChange)
    setWidth(window.innerWidth)
    
    return () => window.removeEventListener('resize', onChange)
  }, [])

  return width || 0
}

// 响应式值钩子，根据屏幕宽度返回不同的值
export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
}): T | undefined {
  const deviceType = useDeviceType()
  
  switch (deviceType) {
    case DeviceType.MOBILE:
      return values.mobile
    case DeviceType.TABLET:
      return values.tablet || values.mobile || values.desktop
    case DeviceType.DESKTOP:
      return values.desktop || values.tablet || values.mobile
    default:
      return values.desktop
  }
}

// 媒体查询钩子
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => {
      setMatches(mql.matches)
    }
    
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      mql.addListener(onChange)
    }
    
    setMatches(mql.matches)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [query])

  return !!matches
}

// 预定义的媒体查询钩子
export function useIsSmallScreen() {
  return useMediaQuery(createMediaQuery(breakpoints.sm))
}

export function useIsMediumScreen() {
  return useMediaQuery(createMediaQueryRange(breakpoints.sm, breakpoints.lg))
}

export function useIsLargeScreen() {
  return useMediaQuery(createMediaQueryMin(breakpoints.lg))
}

// 方向检测
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)')
    const onChange = () => {
      setOrientation(mql.matches ? 'portrait' : 'landscape')
    }
    
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      mql.addListener(onChange)
    }
    
    setOrientation(mql.matches ? 'portrait' : 'landscape')
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return orientation
}
