'use client'

import { useState } from 'react'
import { SAMPLE_ARTWORKS, type SampleArtwork } from '@/lib/game/sample-artworks'
import { ArtworkPreview } from './ArtworkPreview'
import { Heart, Eye, Sparkles, ChevronRight, Copy, Info } from 'lucide-react'

interface SampleGalleryProps {
  onSelectSample?: (artwork: SampleArtwork) => void
}

export function SampleGallery({ onSelectSample }: SampleGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<SampleArtwork | null>(null)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const filteredArtworks = filter === 'all'
    ? SAMPLE_ARTWORKS
    : SAMPLE_ARTWORKS.filter(a => a.difficulty === filter)

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { label: '初级', color: 'bg-green-100 text-green-700', icon: '🌱' }
      case 'intermediate':
        return { label: '中级', color: 'bg-blue-100 text-blue-700', icon: '🎨' }
      case 'advanced':
        return { label: '高级', color: 'bg-purple-100 text-purple-700', icon: '✨' }
      default:
        return { label: '未知', color: 'bg-gray-100 text-gray-700', icon: '❓' }
    }
  }

  const handleUseSample = (artwork: SampleArtwork) => {
    if (onSelectSample) {
      onSelectSample(artwork)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* 标题 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">精选作品集</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
          蓝染大师作品
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          由专业工艺师精心创作的示例作品，展示不同风格和技法，供您学习和参考
        </p>
      </div>

      {/* 难度筛选 */}
      <div className="flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          全部作品
        </button>
        <button
          onClick={() => setFilter('beginner')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'beginner'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          🌱 初级
        </button>
        <button
          onClick={() => setFilter('intermediate')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'intermediate'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          🎨 中级
        </button>
        <button
          onClick={() => setFilter('advanced')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'advanced'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          ✨ 高级
        </button>
      </div>

      {/* 作品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => {
          const difficultyInfo = getDifficultyInfo(artwork.difficulty)
          
          return (
            <div
              key={artwork.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedArtwork(artwork)}
            >
              {/* 真实作品预览 */}
              <div className="aspect-square relative overflow-hidden bg-white">
                {/* 渲染真实作品 */}
                <ArtworkPreview artwork={artwork} size={400} />
                
                {/* 图案数量指示 */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-gray-700 shadow-sm z-20">
                  {artwork.patterns.length} 个图案
                </div>
                
                {/* 难度标签 */}
                <div className={`absolute top-3 right-3 px-3 py-1 ${difficultyInfo.color} backdrop-blur rounded-full text-xs font-semibold shadow-sm z-20`}>
                  {difficultyInfo.icon} {difficultyInfo.label}
                </div>

                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUseSample(artwork)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    <Copy className="w-4 h-4" />
                    使用此模板
                  </button>
                </div>
              </div>

              {/* 作品信息 */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {artwork.name}
                  </h3>
                  <div className="flex items-center gap-1 text-red-500">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{artwork.likes}</span>
                  </div>
                </div>

                <div className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium mb-3">
                  {artwork.style}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {artwork.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {artwork.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {artwork.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{artwork.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* 创作者 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>by {artwork.createdBy}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedArtwork(artwork)
                    }}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    查看详情
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 详情弹窗 */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 内容省略，仅为示例 */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedArtwork.name}</h2>
              <p className="text-gray-700 mb-4">{selectedArtwork.description}</p>
              <button
                onClick={() => handleUseSample(selectedArtwork)}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
