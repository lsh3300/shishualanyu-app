'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

const THEME_STORAGE_KEY = 'indigo-theme'

function ThemeSanitizer({ onForceTheme }: { onForceTheme: (theme?: 'light') => void }) {
  React.useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'system') {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
      onForceTheme('light')
    }

    if (stored === 'dark') {
      localStorage.setItem(THEME_STORAGE_KEY, 'porcelain-blue')
    }

    document.documentElement.classList.remove('system')
    document.documentElement.classList.remove('dark')
  }, [onForceTheme])

  return null
}

/**
 * 渐变蓝韵主题提供者
 * 支持三种主题：light（浅色）、dark（深色）、indigo-gradient（渐变蓝韵）
 * 
 * 配置说明：
 * - enableColorScheme: false - 禁用系统颜色方案干扰，确保主题完全由应用控制
 * - enableSystem: false - 禁用系统主题检测，避免与渐变蓝韵主题冲突
 * - disableTransitionOnChange: false - 启用主题切换过渡动画
 * - attribute: 'class' - 使用 class 属性应用主题
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [forcedTheme, setForcedTheme] = React.useState<'light' | undefined>(() => {
    if (typeof window === 'undefined') return undefined

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
      return stored === 'system' ? 'light' : undefined
    } catch {
      return undefined
    }
  })

  return (
    <NextThemesProvider 
      {...props}
      themes={['light', 'porcelain-blue', 'indigo-gradient']}
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      disableTransitionOnChange={false}
      storageKey="indigo-theme"
      attribute="class"
      forcedTheme={forcedTheme}
    >
      <ThemeSanitizer onForceTheme={setForcedTheme} />
      {children}
    </NextThemesProvider>
  )
}

/**
 * 主题切换钩子的类型定义
 */
export type ThemeType = 'light' | 'porcelain-blue' | 'indigo-gradient'

/**
 * 检查当前是否为渐变蓝韵主题
 */
export function isIndigoGradientTheme(theme: string | undefined): boolean {
  return theme === 'indigo-gradient'
}

/**
 * 检查当前是否为深色系主题（dark 或 indigo-gradient）
 */
export function isDarkTheme(theme: string | undefined): boolean {
  return theme === 'indigo-gradient'
}
