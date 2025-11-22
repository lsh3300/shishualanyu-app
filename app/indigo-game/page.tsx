"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, Star, Lock, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/navigation/bottom-nav"

// 临时数据：关卡配置
const LEVELS = [
  {
    id: 1,
    name: "螺旋手帕",
    category: "新手关卡",
    difficulty: "简单",
    description: "学习最基础的螺旋扎染技法",
    isUnlocked: true,
    stars: 3,
    thumbnail: "/placeholder-level-1.svg"
  },
  {
    id: 2,
    name: "条纹围巾",
    category: "新手关卡",
    difficulty: "简单",
    description: "掌握平行折叠的扎染技巧",
    isUnlocked: true,
    stars: 2,
    thumbnail: "/placeholder-level-2.svg"
  },
  {
    id: 3,
    name: "圆点抱枕",
    category: "新手关卡",
    difficulty: "简单",
    description: "学会用捆扎创造圆点图案",
    isUnlocked: true,
    stars: 0,
    thumbnail: "/placeholder-level-3.svg"
  },
  {
    id: 4,
    name: "花卉蜡染",
    category: "进阶关卡",
    difficulty: "中等",
    description: "初步尝试蜡染工艺",
    isUnlocked: true,
    stars: 0,
    thumbnail: "/placeholder-level-4.svg"
  },
  {
    id: 5,
    name: "云纹桌布",
    category: "进阶关卡",
    difficulty: "中等",
    description: "复刻传统云纹图案",
    isUnlocked: false,
    stars: 0,
    thumbnail: "/placeholder-level-5.svg"
  },
  {
    id: 6,
    name: "冰裂纹大作",
    category: "大师关卡",
    difficulty: "困难",
    description: "挑战复杂的冰裂纹技法",
    isUnlocked: false,
    stars: 0,
    thumbnail: "/placeholder-level-6.svg"
  },
]

export default function IndigoGamePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")
  
  // 玩家数据（后续从状态管理获取）
  const playerData = {
    level: 5,
    coins: 500,
    totalStars: 5,
    completedLevels: 2
  }

  const categories = ["全部", "新手关卡", "进阶关卡", "大师关卡"]
  
  const filteredLevels = selectedCategory === "全部" 
    ? LEVELS 
    : LEVELS.filter(level => level.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 pb-20">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            染蓝时光
          </h1>
          <Link href="/indigo-game/gallery">
            <Button variant="ghost" size="sm">
              <Trophy className="h-4 w-4 mr-1" />
              展厅
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 玩家信息卡片 */}
        <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-blue-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                  {playerData.level}
                </div>
                <div>
                  <p className="text-sm opacity-90">染艺学徒</p>
                  <p className="text-xl font-bold">等级 {playerData.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold">{playerData.totalStars}/18</span>
                </div>
                <div className="text-sm opacity-90">
                  蓝染币: <span className="font-bold">{playerData.coins}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 关卡网格 */}
        <div className="grid grid-cols-2 gap-4">
          {filteredLevels.map((level) => (
            <Card 
              key={level.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                !level.isUnlocked ? 'opacity-60' : 'cursor-pointer'
              }`}
            >
              <CardContent className="p-0">
                {/* 关卡缩略图 */}
                <div className="relative aspect-square bg-gradient-to-br from-indigo-100 to-blue-100">
                  {!level.isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Lock className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {level.isUnlocked && level.stars > 0 && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < level.stars
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <Badge variant="secondary" className="text-xs">
                      {level.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* 关卡信息 */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{level.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {level.description}
                  </p>
                  {level.isUnlocked ? (
                    <Link href={`/indigo-game/levels/${level.id}`}>
                      <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <Play className="h-3 w-3 mr-1" />
                        {level.stars > 0 ? '再次挑战' : '开始游戏'}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Lock className="h-3 w-3 mr-1" />
                      未解锁
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>完成更多关卡解锁高级技法</p>
          <p className="mt-1">已完成 {playerData.completedLevels}/{LEVELS.length} 关</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
