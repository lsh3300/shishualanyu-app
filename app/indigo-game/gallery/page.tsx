"use client"

import { ArrowLeft, Share2, Download, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/navigation/bottom-nav"

// 临时数据：玩家作品
const ARTWORKS = [
  {
    id: 1,
    levelName: "螺旋手帕",
    stars: 3,
    completedAt: "2025-11-22",
    thumbnail: "/placeholder-artwork-1.svg",
    similarity: 0.95
  },
  {
    id: 2,
    levelName: "条纹围巾",
    stars: 2,
    completedAt: "2025-11-21",
    thumbnail: "/placeholder-artwork-2.svg",
    similarity: 0.82
  },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 pb-20">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/indigo-game">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            作品展厅
          </h1>
          <div className="w-10" /> {/* 占位 */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{ARTWORKS.length}</p>
                <p className="text-xs text-muted-foreground">作品数量</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {ARTWORKS.reduce((sum, art) => sum + art.stars, 0)}
                </p>
                <p className="text-xs text-muted-foreground">获得星星</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {Math.round(ARTWORKS.reduce((sum, art) => sum + art.similarity, 0) / ARTWORKS.length * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">平均相似度</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 作品网格 */}
        <div className="grid grid-cols-2 gap-4">
          {ARTWORKS.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-0">
                {/* 作品图片 */}
                <div className="relative aspect-square bg-gradient-to-br from-indigo-100 to-blue-100">
                  <div className="absolute top-2 right-2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < artwork.stars
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge className="absolute top-2 left-2 text-xs">
                    {Math.round(artwork.similarity * 100)}%
                  </Badge>
                </div>

                {/* 作品信息 */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{artwork.levelName}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{artwork.completedAt}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="h-3 w-3 mr-1" />
                      分享
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态提示 */}
        {ARTWORKS.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <Star className="h-12 w-12 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">还没有作品</h3>
            <p className="text-muted-foreground mb-4">完成关卡后，你的作品会出现在这里</p>
            <Link href="/indigo-game">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                开始创作
              </Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
