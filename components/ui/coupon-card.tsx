import React from "react"
import { Gift } from "lucide-react"
import Link from "next/link"

interface CouponCardProps {
  count: number
  href: string
  onClick?: () => void
}

export function CouponCard({ count, href, onClick }: CouponCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-primary rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all duration-300 group">
        {/* 装饰性波浪图案 */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute right-20 bottom-5 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Gift className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-lg">优惠券</h4>
            <p className="text-sm opacity-90">{count}张可用</p>
          </div>
          
          <div className="h-full w-px bg-white/20 absolute right-12 top-0" />
          
          <div className="flex items-center gap-1 pr-2 group-hover:translate-x-1 transition-transform duration-200">
            <span className="text-sm">查看全部</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* 装饰性边角 */}
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div className="absolute transform rotate-45 bg-background -top-6 -right-6 w-16 h-16" />
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden">
          <div className="absolute transform rotate-45 bg-background -bottom-6 -right-6 w-16 h-16" />
        </div>
      </div>
    </Link>
  )
}