'use client'

import { SampleGallery } from '@/components/game/samples/SampleGallery'
import { GameStatusBar } from '@/components/game/core/GameStatusBar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SampleArtwork } from '@/lib/game/sample-artworks'

export default function SamplesPage() {
  const router = useRouter()

  const handleSelectSample = (artwork: SampleArtwork) => {
    // 将作品数据保存到 localStorage
    localStorage.setItem('selectedSample', JSON.stringify(artwork))
    // 跳转到工坊页面
    router.push('/game/workshop')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <GameStatusBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/game/workshop">
            <Button variant="ghost" size="sm" className="gap-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              返回工坊
            </Button>
          </Link>
        </div>

        {/* 作品画廊 */}
        <SampleGallery onSelectSample={handleSelectSample} />
      </div>
    </div>
  )
}
