'use client'

import { useState } from 'react'
import { RealisticIndigoCanvas } from '@/components/game/canvas/RealisticIndigoCanvas'
import type { ClothLayer } from '@/types/game.types'

/**
 * 真实蓝染创作工坊（新版）
 * 使用染色模拟引擎，生成真实的蓝染效果
 */
export default function RealisticWorkshopPage() {
  const [layers, setLayers] = useState<ClothLayer[]>([])
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <span className="text-2xl">🎨</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              真实蓝染创作工坊
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              染色模拟引擎
            </span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            使用真实的染色模拟算法，创作出接近真实蓝染作品的效果。<br/>
            选择扎染技法，点击画布设置扎染点，观察染料的自然扩散。
          </p>
        </div>

        {/* 对比提示 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">新技术：染色模拟引擎</h3>
              <p className="text-sm text-blue-700 mb-2">
                这个版本使用了全新的染色模拟算法，模拟染料在布料上的真实扩散过程，
                包括折痕、白色留白区域、放射线等真实蓝染特征。
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white rounded text-xs">✅ 放射状折痕</span>
                <span className="px-2 py-1 bg-white rounded text-xs">✅ 白色留白</span>
                <span className="px-2 py-1 bg-white rounded text-xs">✅ 自然扩散</span>
                <span className="px-2 py-1 bg-white rounded text-xs">✅ 手工感</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：创作区 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <RealisticIndigoCanvas
                width={600}
                height={600}
                onLayersChange={setLayers}
              />
            </div>
          </div>

          {/* 右侧：说明和参考 */}
          <div className="space-y-6">
            {/* 技法说明 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>📚</span>
                扎染技法说明
              </h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2">
                    <span>🕷️</span>
                    蜘蛛扎染（Kumo Shibori）
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    从中心点向外放射，形成蜘蛛网状图案。中心保持白色，染料沿放射线扩散。
                  </p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-medium text-indigo-900 flex items-center gap-2">
                    <span>▦</span>
                    板缔（Itajime Shibori）
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    折叠布料后用木板夹住，形成几何对称图案。有清晰的折痕和对称性。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-purple-900 flex items-center gap-2">
                    <span>🌀</span>
                    岚染（Arashi Shibori）
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    将布料斜向缠绕在管子上，形成雨线效果。有流动感和斜向线条。
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-medium text-pink-900 flex items-center gap-2">
                    <span>🦌</span>
                    鹿の子（Kanoko Shibori）
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    多点绑扎，形成小圆点散布图案。每个圆点大小和位置略有不同。
                  </p>
                </div>
              </div>
            </div>

            {/* 操作提示 */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-4">⚡ 快速上手</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>选择一种扎染技法（蜘蛛扎染、板缔等）</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>调整参数（大小、强度、对称性等）</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>在画布上点击，设置扎染点</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span>观察染料自动扩散，形成真实效果</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span>可以添加多个扎染点，创作复杂图案</span>
                </li>
              </ol>
            </div>

            {/* 真实作品参考 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🖼️</span>
                真实作品参考
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-xs text-blue-900 font-medium">
                  放射状图案<br/>参考图
                </div>
                <div className="aspect-square bg-gradient-to-br from-indigo-200 to-indigo-400 rounded-lg flex items-center justify-center text-xs text-indigo-900 font-medium">
                  对称图案<br/>参考图
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-200 to-purple-400 rounded-lg flex items-center justify-center text-xs text-purple-900 font-medium">
                  斜向雨线<br/>参考图
                </div>
                <div className="aspect-square bg-gradient-to-br from-pink-200 to-pink-400 rounded-lg flex items-center justify-center text-xs text-pink-900 font-medium">
                  散点图案<br/>参考图
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * 这些是真实蓝染作品的特征，我们的系统模拟了这些效果
              </p>
            </div>

            {/* 技术说明 */}
            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>⚙️</span>
                技术特性
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Canvas染料扩散算法</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>真实靛蓝色调系统</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>布料纹理叠加</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>随机噪点模拟不均匀</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>多种扎染技法支持</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/game/workshop"
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-400 transition-colors font-medium"
          >
            ← 返回简单模式
          </a>
          <a
            href="/game/hub"
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-400 transition-colors font-medium"
          >
            返回游戏中心
          </a>
        </div>
      </div>
    </div>
  )
}
