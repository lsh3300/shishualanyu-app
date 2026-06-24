'use client'

import { BookOpen, FileQuestion, FileText, Package, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type EmptyStateType = 'default' | 'search' | 'users' | 'products' | 'courses' | 'content'

export interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

function getDefaultIcon(type: EmptyStateType) {
  switch (type) {
    case 'search':
      return <Search className="h-12 w-12 text-[#8aa0bf]" />
    case 'users':
      return <Users className="h-12 w-12 text-[#8aa0bf]" />
    case 'products':
      return <Package className="h-12 w-12 text-[#8aa0bf]" />
    case 'courses':
      return <BookOpen className="h-12 w-12 text-[#8aa0bf]" />
    case 'content':
      return <FileText className="h-12 w-12 text-[#8aa0bf]" />
    default:
      return <FileQuestion className="h-12 w-12 text-[#8aa0bf]" />
  }
}

function getDefaultTitle(type: EmptyStateType) {
  switch (type) {
    case 'search':
      return '没有找到结果'
    case 'users':
      return '暂无用户'
    case 'products':
      return '暂无商品'
    case 'courses':
      return '暂无课程'
    case 'content':
      return '暂无待处理内容'
    default:
      return '暂无数据'
  }
}

function getDefaultDescription(type: EmptyStateType) {
  switch (type) {
    case 'search':
      return '可以换个关键词，或者放宽筛选条件再试一次。'
    case 'users':
      return '当前还没有可展示的用户记录。'
    case 'products':
      return '先补齐一批真实商品，后台演示会完整很多。'
    case 'courses':
      return '先创建几门真实课程，后台链路会更像正式系统。'
    case 'content':
      return '当前没有需要审核或处理的内容。'
    default:
      return '当前没有可展示的数据。'
  }
}

export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d9e6f6] bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(243,248,255,0.92)_100%)] px-5 py-14 text-center shadow-[0_10px_24px_rgba(61,92,140,0.05)] ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#edf4ff]">
        {getDefaultIcon(type)}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#264268]">{title || getDefaultTitle(type)}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#6f87aa]">{description || getDefaultDescription(type)}</p>
      {action ? (
        <Button variant="outline" className="mt-5 rounded-full border-[#d9e6f6] bg-white/90" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

export default EmptyState
