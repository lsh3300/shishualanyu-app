"use client"

import { motion } from "framer-motion"
import { Image as ImageIcon, Users, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

/**
 * 作品墙组件 - 瀑布流展示用户创作
 * 设计理念：像蓝染工坊的晾晒墙，展示"刚染好的作品"
 * 目前为空状态，未来可连接真实用户数据
 */
export default function WorksGallery({ works = [] }: WorksGalleryProps) {
  // 空状态：目前没有作品
  if (works.length === 0) {
    return (
      <div className="sticky top-20 h-fit">
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 backdrop-blur-sm">
          <CardContent className="py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              {/* 图标动画 */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex justify-center"
              >
                <div className="relative">
                  <ImageIcon className="h-16 w-16 text-blue-300" strokeWidth={1.5} />
                  
                  {/* 晾晒绳子效果 */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-blue-200" />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 -ml-12 w-2 h-2 rounded-full bg-blue-300" />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 ml-12 w-2 h-2 rounded-full bg-blue-300" />
                </div>
              </motion.div>

              {/* 空状态文案 */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  作品晾晒区
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                  暂时还没有作品展示
                </p>
                <p className="text-xs text-blue-500 max-w-xs mx-auto">
                  完成创作后，您的作品将会出现在这里<br/>
                  与其他用户分享您的艺术成果
                </p>
              </div>

              {/* 统计信息（占位） */}
              <div className="flex justify-center gap-4 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Users className="h-4 w-4" />
                  <span>0 位创作者</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <ImageIcon className="h-4 w-4" />
                  <span>0 件作品</span>
                </div>
              </div>

              {/* 装饰性蓝染纹样 */}
              <div className="flex justify-center gap-3 pt-4 opacity-30">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* 提示卡片 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    即将推出
                  </h4>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    作品墙功能正在开发中，未来您可以：
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-blue-600">
                    <li className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>浏览其他用户的精彩作品</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>为喜欢的作品点赞收藏</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>与创作者交流学习</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // 有作品时的展示（瀑布流布局）
  return (
    <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800">作品晾晒区</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Users className="h-3 w-3 mr-1" />
            {works.length} 件作品
          </Badge>
        </div>

        {/* 瀑布流网格 */}
        <div className="grid grid-cols-1 gap-4">
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="relative aspect-square">
                  <img
                    src={work.processedImage}
                    alt="作品"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 悬停遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-xs font-medium">{work.username}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                        <Clock className="h-3 w-3" />
                        <span>{work.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 风格标签 */}
                  <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                    {work.style}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
