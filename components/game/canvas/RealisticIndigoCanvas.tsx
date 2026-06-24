'use client'

import { useState, useRef, useEffect } from 'react'
import { DyeSimulator, TiePoint } from '@/lib/game/dye-simulation/DyeSimulator'
import { DyeRenderer } from '@/lib/game/dye-simulation/DyeRenderer'
import type { ClothLayer } from '@/types/game.types'

/**
 * 扎染技法定义
 */
export const TIE_DYE_TECHNIQUES = [
  {
    id: 'kumo',
    name: '蜘蛛扎染',
    nameEn: 'Kumo Shibori',
    icon: '🕷️',
    description: '从中心点放射，形成蜘蛛网状',
    defaultSymmetry: 8,
    preview: '/patterns/kumo-preview.jpg'
  },
  {
    id: 'itajime',
    name: '板缔',
    nameEn: 'Itajime Shibori',
    icon: '▦',
    description: '折叠后夹板压制，形成几何对称图案',
    defaultSymmetry: 4,
    preview: '/patterns/itajime-preview.jpg'
  },
  {
    id: 'arashi',
    name: '岚染',
    nameEn: 'Arashi Shibori',
    icon: '🌀',
    description: '斜向缠绕，形成雨线效果',
    defaultSymmetry: 2,
    preview: '/patterns/arashi-preview.jpg'
  },
  {
    id: 'kanoko',
    name: '鹿の子',
    nameEn: 'Kanoko Shibori',
    icon: '🦌',
    description: '多点绑扎，形成小圆点图案',
    defaultSymmetry: 6,
    preview: '/patterns/kanoko-preview.jpg'
  }
] as const

interface RealisticIndigoCanvasProps {
  width?: number
  height?: number
  onLayersChange?: (layers: ClothLayer[]) => void
}

export function RealisticIndigoCanvas({
  width = 600,
  height = 600,
  onLayersChange
}: RealisticIndigoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [simulator] = useState(() => new DyeSimulator(width, height))
  const [renderer, setRenderer] = useState<DyeRenderer | null>(null)
  
  const [tiePoints, setTiePoints] = useState<TiePoint[]>([])
  const [selectedTechnique, setSelectedTechnique] = useState<typeof TIE_DYE_TECHNIQUES[number]['id'] | null>('kumo')
  const [currentConfig, setCurrentConfig] = useState({
    size: 50,
    intensity: 0.7,
    symmetry: 8,
    irregularity: 0.3
  })
  
  const [isRendering, setIsRendering] = useState(false)
  
  // 初始化渲染器
  useEffect(() => {
    if (canvasRef.current && !renderer) {
      const newRenderer = new DyeRenderer(canvasRef.current)
      setRenderer(newRenderer)
      newRenderer.clear()
    }
  }, [renderer])
  
  /**
   * 添加扎染点
   */
  const addTiePoint = (x: number, y: number) => {
    if (!selectedTechnique) return
    
    const newPoint: TiePoint = {
      x,
      y,
      type: selectedTechnique as TiePoint['type'],
      size: currentConfig.size,
      intensity: currentConfig.intensity,
      symmetry: currentConfig.symmetry,
      irregularity: currentConfig.irregularity
    }
    
    setTiePoints(prev => [...prev, newPoint])
  }
  
  /**
   * 渲染所有扎染点
   */
  const renderDyeing = async () => {
    if (!renderer) return
    
    setIsRendering(true)
    
    // 清空模拟器
    simulator.clear()
    
    // 应用所有扎染点
    for (const point of tiePoints) {
      simulator.applyTiePoint(point)
    }
    
    // 模糊扩散（可选）
    simulator.blur(2)
    
    // 渲染到Canvas
    renderer.render(simulator.getFabric(), {
      addFabricTexture: true,
      addNoise: true,
      noiseIntensity: 0.05
    })
    
    setIsRendering(false)
    
    // 通知父组件
    if (onLayersChange) {
      const layers: ClothLayer[] = tiePoints.map((point, idx) => ({
        userId: 'temp-user',  // 临时用户ID
        textureId: point.type,  // 使用技法类型作为textureId
        params: {
          x: point.x,
          y: point.y,
          scale: point.size / 50,
          opacity: point.intensity,
          rotation: 0
        },
        dyeDepth: point.intensity,
        timestamp: new Date().toISOString()
      }))
      onLayersChange(layers)
    }
  }
  
  // 当扎染点变化时，重新渲染
  useEffect(() => {
    renderDyeing()
  }, [tiePoints])
  
  /**
   * 处理画布点击
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !selectedTechnique) return
    
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    addTiePoint(x, y)
  }
  
  /**
   * 清空画布
   */
  const clearCanvas = () => {
    setTiePoints([])
    simulator.clear()
    renderer?.clear()
  }
  
  return (
    <div className="space-y-4">
      {/* 技法选择器 */}
      <div className="grid grid-cols-4 gap-3">
        {TIE_DYE_TECHNIQUES.map((technique) => (
          <button
            key={technique.id}
            onClick={() => {
              setSelectedTechnique(technique.id)
              setCurrentConfig(prev => ({
                ...prev,
                symmetry: technique.defaultSymmetry
              }))
            }}
            className={`
              p-4 rounded-xl border-2 transition-all
              ${selectedTechnique === technique.id
                ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-3xl mb-2">{technique.icon}</div>
            <div className="text-sm font-medium text-gray-900">{technique.name}</div>
            <div className="text-xs text-gray-500 mt-1">{technique.nameEn}</div>
          </button>
        ))}
      </div>
      
      {/* 参数调整 */}
      {selectedTechnique && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-900 mb-3">扎染参数</h3>
          
          <div>
            <label className="text-sm text-gray-600 flex justify-between mb-1">
              <span>绑扎大小</span>
              <span className="font-medium">{currentConfig.size}</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={currentConfig.size}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, size: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600 flex justify-between mb-1">
              <span>染色强度</span>
              <span className="font-medium">{(currentConfig.intensity * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentConfig.intensity * 100}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, intensity: Number(e.target.value) / 100 }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600 flex justify-between mb-1">
              <span>对称性</span>
              <span className="font-medium">{currentConfig.symmetry}</span>
            </label>
            <input
              type="range"
              min="3"
              max="16"
              value={currentConfig.symmetry}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, symmetry: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600 flex justify-between mb-1">
              <span>不规则度</span>
              <span className="font-medium">{(currentConfig.irregularity * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentConfig.irregularity * 100}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, irregularity: Number(e.target.value) / 100 }))}
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Canvas画布 */}
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          className="
            rounded-2xl shadow-lg cursor-crosshair border-4 border-gray-200
            hover:border-blue-300 transition-colors
          "
          style={{
            width: `${width}px`,
            height: `${height}px`,
            imageRendering: 'crisp-edges'
          }}
        />
        
        {/* 空画布提示 */}
        {tiePoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 bg-white/80 px-6 py-4 rounded-xl">
              <p className="text-lg mb-2">🎨 选择技法后点击画布</p>
              <p className="text-sm">开始创作真实的蓝染作品</p>
            </div>
          </div>
        )}
        
        {/* 渲染中提示 */}
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
            <div className="bg-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm font-medium">渲染中...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={clearCanvas}
          className="
            flex-1 px-6 py-3 rounded-xl border-2 border-gray-300
            hover:border-red-400 hover:bg-red-50 transition-colors
            font-medium text-gray-700
          "
        >
          🗑️ 清空画布
        </button>
        
        <button
          onClick={renderDyeing}
          disabled={tiePoints.length === 0}
          className="
            flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white
            hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors font-medium shadow-lg
          "
        >
          🎨 重新渲染
        </button>
      </div>
      
      {/* 扎染点列表 */}
      {tiePoints.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            扎染点 ({tiePoints.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tiePoints.map((point, idx) => {
              const technique = TIE_DYE_TECHNIQUES.find(t => t.id === point.type)
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{technique?.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{technique?.name}</div>
                      <div className="text-xs text-gray-500">
                        位置: ({point.x.toFixed(0)}, {point.y.toFixed(0)}) | 
                        强度: {(point.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTiePoints(prev => prev.filter((_, i) => i !== idx))
                    }}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
