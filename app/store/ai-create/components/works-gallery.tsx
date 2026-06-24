"use client"

import { motion } from "framer-motion"
import { Image as ImageIcon, Users, Clock, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface UserWork {
  id: string
  originalImage: string
  processedImage: string
  style: string
  username: string
  createdAt: Date
}

interface WorksGalleryProps {
  works?: UserWork[]
}

export default function WorksGallery({ works = [] }: WorksGalleryProps) {
  if (works.length === 0) {
    return (
      <Card className="overflow-hidden rounded-[30px] border-blue-100 bg-white/82 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <CardContent className="space-y-4 p-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-sm">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-blue-900">成品陈列</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">当前舞台只展示本轮生成结果，不抢创作区主画面。</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-center">
                <p className="text-xl font-bold text-blue-800">0</p>
                <p className="mt-1 text-xs text-slate-500">待生成</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-indigo-50/70 p-4 text-center">
                <p className="text-xl font-bold text-indigo-800">0</p>
                <p className="mt-1 text-xs text-slate-500">本轮成品</p>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-4 text-sm text-slate-600">
              生成完成后，这里会自动展示本轮蓝染结果卡片。
            </div>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-900">作品展示</h3>
        <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
          <Users className="mr-1 h-3 w-3" />
          {works.length} 件作品
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {works.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="overflow-hidden rounded-[26px] border-blue-100 bg-white/85 transition-all hover:shadow-lg">
              <div className="relative aspect-[4/5] bg-muted">
                <OptimizedImage
                  src={work.processedImage}
                  alt="作品"
                  fill
                  usage="card"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className="rounded-full bg-blue-600 text-white">{work.style}</Badge>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <Heart className="h-3.5 w-3.5" />
                      <span>收藏中</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{work.username}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/75">
                    <Clock className="h-3 w-3" />
                    <span>{work.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
