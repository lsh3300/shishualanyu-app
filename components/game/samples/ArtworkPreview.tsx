'use client'

import { getPatternById } from '@/components/game/patterns/PatternLibrary'
import type { SampleArtwork } from '@/lib/game/sample-artworks'

interface ArtworkPreviewProps {
  artwork: SampleArtwork
  size?: number
}

/**
 * 作品预览组件
 * 渲染示例作品的真实视觉效果
 */
export function ArtworkPreview({ artwork, size = 300 }: ArtworkPreviewProps) {
  // 根据染色深度计算真实靛蓝色
  const getIndigoColor = (depth: number) => {
    const colors = [
      '#C5D5E4', // 极浅靛蓝 0.0-0.2
      '#8FA9C3', // 浅靛蓝 0.2-0.4
      '#5B7FA1', // 中靛蓝 0.4-0.6
      '#3D5A80', // 深靛蓝 0.6-0.8
      '#1E4D8B'  // 极深靛蓝 0.8-1.0
    ]
    const index = Math.min(Math.floor(depth * 5), 4)
    return colors[index]
  }

  return (
    <div 
      className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden w-full h-full"
    >
      {/* 画布背景纹理 */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* 渲染所有图案 - 与IndigoCanvas保持一致 */}
      <div className="absolute inset-0">
        {artwork.patterns.map((pattern, index) => {
          const patternDef = getPatternById(pattern.patternId)
          if (!patternDef) return null

          const PatternComponent = patternDef.component
          const color = getIndigoColor(pattern.dyeDepth)

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${pattern.x}%`,
                top: `${pattern.y}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                mixBlendMode: 'multiply', // 蓝染混合效果
                userSelect: 'none'
              }}
            >
              <PatternComponent
                color={color}
                opacity={pattern.opacity}
                scale={pattern.scale}
                rotation={pattern.rotation}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
