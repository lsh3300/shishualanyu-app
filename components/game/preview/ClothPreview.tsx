'use client'

import { useRef, useEffect, useState, memo } from 'react'
import type { ClothLayer } from '@/types/game.types'
import { getPatternById } from '../patterns/PatternLibrary'

interface ClothPreviewProps {
  layers: ClothLayer[]
  width?: number
  height?: number
  className?: string
  showFrame?: boolean
}

// 原始画布大小（创作工坊使用的尺寸）
const ORIGINAL_CANVAS_SIZE = 500

/**
 * 作品预览组件 - SVG版本（优化版）
 * 使用 memo 减少不必要的重渲染
 * 使用与创作工坊相同的 SVG 组件渲染，保持视觉一致性
 */
export const ClothPreview = memo(function ClothPreview({
  layers,
  className = '',
  showFrame = false
}: ClothPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState(300)
  const [isVisible, setIsVisible] = useState(false)

  // 使用 IntersectionObserver 实现懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // 监听容器大小变化
  useEffect(() => {
    if (!isVisible) return

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize(Math.min(rect.width, rect.height))
      }
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [isVisible])

  // 计算整体缩放比例
  const overallScale = containerSize / ORIGINAL_CANVAS_SIZE

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '1 / 1',
        backgroundColor: '#F5F1E8',
        borderRadius: showFrame ? '8px' : '0',
        border: showFrame ? '4px solid #8B6F47' : 'none'
      }}
    >
      {/* 布料纹理背景 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0,0,0,0.015) 1px,
              rgba(0,0,0,0.015) 2px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(0,0,0,0.012) 1px,
              rgba(0,0,0,0.012) 2px
            )
          `
        }}
      />

      {/* 内容容器 - 使用 transform 整体缩放（懒加载） */}
      {isVisible && (
        <div
          className="absolute"
          style={{
            width: ORIGINAL_CANVAS_SIZE,
            height: ORIGINAL_CANVAS_SIZE,
            transformOrigin: 'top left',
            transform: `scale(${overallScale})`,
          }}
        >
          {/* 渲染每个图层 - 使用原始坐标和缩放 */}
          {layers.map((layer, index) => (
            <PatternLayer 
              key={index} 
              layer={layer}
            />
          ))}
        </div>
      )}
    </div>
  )
})

/**
 * 单个图案图层
 * 使用与创作工坊完全相同的渲染方式
 */
function PatternLayer({ 
  layer
}: { 
  layer: ClothLayer
}) {
  const patternDef = getPatternById(layer.textureId)
  if (!patternDef) return null

  const {
    x: xPercent,
    y: yPercent,
    scale: layerScale,
    opacity,
    rotation = 0
  } = layer.params

  // 根据染色深度计算靛蓝色
  const color = getIndigoColor(layer.dyeDepth)

  // 获取 SVG 组件
  const PatternComponent = patternDef.component

  // 直接使用图层的 scale，与创作工坊一致
  // 不需要额外计算，因为整个容器已经按比例缩放了
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'multiply',
      }}
    >
      <PatternComponent 
        color={color}
        opacity={opacity}
        scale={layerScale}
        rotation={rotation}
      />
    </div>
  )
}

/**
 * 根据染色深度获取靛蓝色
 */
function getIndigoColor(depth: number): string {
  // 真实靛蓝色系 - 从浅到深
  const colors = [
    '#C5D5E4', // 极浅靛蓝 0.0-0.2
    '#8FA9C3', // 浅靛蓝 0.2-0.4
    '#5B7FA1', // 中靛蓝 0.4-0.6
    '#3A5A7B', // 深靛蓝 0.6-0.8
    '#1E3A5F'  // 浓靛蓝 0.8-1.0
  ]
  const index = Math.min(Math.floor(depth * 5), 4)
  return colors[index]
}
