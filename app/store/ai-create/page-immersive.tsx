"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { toast } from "sonner"

// 导入新的沉浸式组件
import InkBackground from "./components/ink-background"
import TraditionalPattern from "./components/traditional-pattern"
import DyeVatUpload from "./components/dye-vat-upload"
import WorksGallery from "./components/works-gallery"
import StyleSelection from "./components/style-selection"
import ParameterAdjustment from "./components/parameter-adjustment"
import PreviewComparison from "./components/preview-comparison"

/**
 * 沉浸式AI蓝染创作页面
 * 设计理念：让用户感觉置身于真实的蓝染工坊中
 * 核心体验：动态背景 + 染缸上传 + 流畅动画 + 传统元素
 */
export default function ImmersiveAICreate() {
  // 状态管理
  const [currentStep, setCurrentStep] = useState<'upload' | 'style' | 'adjust' | 'preview'>('upload')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [parameters, setParameters] = useState({
    styleStrength: 75,
    detailRetention: 50,
    colorSaturation: 60,
    textureComplexity: 65,
    artEffectIntensity: 70
  })
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // 处理图片上传
  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData)
    
    // 延迟切换到风格选择，让动画完成
    setTimeout(() => {
      setCurrentStep('style')
      toast.success("图片已投入染缸！请选择您喜欢的蓝染风格", {
        duration: 3000,
      })
    }, 1200)
  }, [])

  // 处理风格选择
  const handleStyleSelect = useCallback((styleId: string) => {
    setSelectedStyle(styleId)
    setCurrentStep('adjust')
    toast.success("风格选择完成！您可以调整参数或直接生成", {
      duration: 3000,
    })
  }, [])

  // 处理参数调整
  const handleParametersChange = useCallback((newParameters: typeof parameters) => {
    setParameters(newParameters)
  }, [])

  // 生成预览
  const handleGeneratePreview = useCallback(async () => {
    if (!uploadedImage || !selectedStyle) return
    
    setIsGenerating(true)
    toast("AI正在施展魔法...", {
      description: "墨染云烟，稍候片刻",
      duration: 3000,
    })
    
    // 模拟AI生成过程
    setTimeout(() => {
      setGeneratedImage(uploadedImage) // 实际应该是AI生成的图片
      setIsGenerating(false)
      setCurrentStep('preview')
      toast.success("创作完成！", {
        description: "您的蓝染艺术品已生成",
      })
    }, 3000)
  }, [uploadedImage, selectedStyle])

  // 重新开始
  const handleRestart = useCallback(() => {
    setCurrentStep('upload')
    setUploadedImage(null)
    setSelectedStyle(null)
    setGeneratedImage(null)
    toast.info("开始新的创作之旅")
  }, [])

  // 音效控制
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev)
    toast(audioEnabled ? "环境音已关闭" : "环境音已开启", {
      duration: 2000,
    })
  }, [audioEnabled])

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* ===== 背景层 ===== */}
      <InkBackground />
      <TraditionalPattern />

      {/* ===== 顶部导航栏 ===== */}
      <header className="relative z-40 bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/store">
              <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            {/* 页面标题 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">AI蓝染创作工坊</h1>
                <p className="text-xs text-blue-600">传统工艺 × 人工智能</p>
              </div>
            </motion.div>
          </div>

          {/* 音效控制 */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAudio}
            className="hover:bg-blue-50"
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 步骤指示器 */}
        <div className="px-4 pb-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {[
              { key: 'upload', label: '投入染缸', number: 1 },
              { key: 'style', label: '选择风格', number: 2 },
              { key: 'adjust', label: '调配染料', number: 3 },
              { key: 'preview', label: '预览成品', number: 4 },
            ].map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <motion.div
                  className={`flex items-center gap-2 flex-1 ${
                    currentStep === step.key
                      ? 'text-blue-700 font-medium'
                      : index < ['upload', 'style', 'adjust', 'preview'].indexOf(currentStep)
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}
                  animate={{
                    scale: currentStep === step.key ? 1.05 : 1,
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStep === step.key
                        ? 'bg-blue-600 text-white'
                        : index < ['upload', 'style', 'adjust', 'preview'].indexOf(currentStep)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-xs hidden sm:inline">{step.label}</span>
                </motion.div>
                {index < 3 && (
                  <div className="w-full h-0.5 bg-gray-200 mx-2">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: index < ['upload', 'style', 'adjust', 'preview'].indexOf(currentStep) ? '100%' : 0
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ===== 主内容区 ===== */}
      <main className="relative z-10 p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* 左侧主区域 (2列宽) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* 上传步骤 */}
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <DyeVatUpload onImageUpload={handleImageUpload} />
                </motion.div>
              )}

              {/* 风格选择步骤 */}
              {currentStep === 'style' && uploadedImage && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <StyleSelection
                    onStyleSelect={handleStyleSelect}
                    uploadedImage={uploadedImage}
                  />
                </motion.div>
              )}

              {/* 参数调整步骤 */}
              {currentStep === 'adjust' && (
                <motion.div
                  key="adjust"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <ParameterAdjustment
                    parameters={parameters}
                    onParametersChange={handleParametersChange}
                    isGenerating={isGenerating}
                  />
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('style')}
                    >
                      返回选择风格
                    </Button>
                    <Button
                      onClick={handleGeneratePreview}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {isGenerating ? "染制中..." : "开始染制"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 预览步骤 */}
              {currentStep === 'preview' && generatedImage && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <PreviewComparison
                    originalImage={uploadedImage}
                    generatedImage={generatedImage}
                  />
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('adjust')}
                    >
                      重新调整
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRestart}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        再来一次
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 右侧作品墙 */}
          <div className="lg:col-span-1">
            <WorksGallery works={[]} />
          </div>
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
