"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, Upload, Palette, Sliders, Eye, Download, Wand2, Share2, History, BookOpen } from "lucide-react"
import Link from "next/link"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { motion } from "framer-motion"
import { toast } from "sonner"

// 导入子组件
import ImageUpload from "./components/image-upload"
import StyleSelection from "./components/style-selection"
import ParameterAdjustment from "./components/parameter-adjustment"
import PreviewComparison from "./components/preview-comparison"
import SaveOperationPanel from "./components/save-operation-panel"

// 定义创作历史记录类型
interface CreationHistory {
  id: string
  date: Date
  image: string
  style: string
  parameters: any
}

export default function AICreateLayout() {
  const [activeTab, setActiveTab] = useState("upload")
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
  const [generationProgress, setGenerationProgress] = useState(0)
  const [creationHistory, setCreationHistory] = useState<CreationHistory[]>([])
  const [showTutorial, setShowTutorial] = useState(false)
  
  // 模拟生成进度
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 150)
      
      return () => clearInterval(interval)
    } else {
      setGenerationProgress(0)
    }
  }, [isGenerating])

  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData)
    setActiveTab("style")
    toast.success("图片上传成功！请选择创作风格")
  }, [])

  const handleStyleSelect = useCallback((styleId: string) => {
    setSelectedStyle(styleId)
    setActiveTab("adjust")
    toast.success("风格选择成功！请调整创作参数")
  }, [])

  const handleParametersChange = useCallback((newParameters: typeof parameters) => {
    setParameters(newParameters)
  }, [])

  const handleGeneratePreview = useCallback(async () => {
    if (!uploadedImage || !selectedStyle) return
    
    setIsGenerating(true)
    setGenerationProgress(0)
    
    // 模拟AI生成过程
    setTimeout(() => {
      // 这里应该是实际的AI生成API调用
      // 现在使用占位符图片
      setGeneratedImage(uploadedImage) // 实际应该是AI生成的图片
      setIsGenerating(false)
      setActiveTab("preview")
      
      // 添加到历史记录
      const newHistory: CreationHistory = {
        id: Date.now().toString(),
        date: new Date(),
        image: uploadedImage,
        style: selectedStyle || "",
        parameters: {...parameters}
      }
      
      setCreationHistory(prev => [newHistory, ...prev].slice(0, 10))
      toast.success("AI创作完成！您可以预览和保存作品")
    }, 3000)
  }, [uploadedImage, selectedStyle, parameters])

  const handleSaveImage = useCallback(() => {
    if (!generatedImage) return
    
    // 实现保存图片的逻辑
    // 可以是下载到本地或保存到用户账户
    toast.success("作品已保存到您的创作集")
  }, [generatedImage])
  
  const handleShareCreation = useCallback(() => {
    if (!generatedImage) return
    
    // 实现分享功能
    toast.success("分享链接已复制到剪贴板")
  }, [generatedImage])
  
  const handleRestoreFromHistory = useCallback((historyItem: CreationHistory) => {
    setUploadedImage(historyItem.image)
    setSelectedStyle(historyItem.style)
    setParameters(historyItem.parameters)
    setGeneratedImage(historyItem.image) // 实际应该重新生成
    setActiveTab("preview")
    toast.info("已从历史记录恢复创作")
  }, [])

  const canProceedToStyle = !!uploadedImage
  const canProceedToAdjust = canProceedToStyle && !!selectedStyle
  const canProceedToPreview = canProceedToAdjust && !!generatedImage

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
          <Link href="/store">
            <Button variant="ghost" size="icon" className="hover:bg-blue-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex items-center gap-2 text-blue-700">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI蓝染创作
          </h1>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" onClick={() => setShowTutorial(!showTutorial)}>
            <BookOpen className="h-4 w-4 mr-2" />
            使用指南
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("历史记录功能即将上线")}>
            <History className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-7xl mx-auto">
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h3 className="font-medium text-blue-800 mb-2">AI蓝染创作指南</h3>
            <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
              <li>上传您喜欢的图片（支持JPG、PNG格式）</li>
              <li>从多种蓝染风格中选择您喜欢的样式</li>
              <li>调整参数以获得理想的艺术效果</li>
              <li>生成预览并保存您的独特蓝染创作</li>
              <li>分享您的作品或应用到实体产品</li>
            </ol>
            <Button variant="ghost" size="sm" className="mt-2 text-blue-600" onClick={() => setShowTutorial(false)}>
              关闭指南
            </Button>
          </motion.div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">AI蓝染创作工坊</h2>
          <p className="text-muted-foreground">
            上传您的图片，使用AI技术将其转换为独特的蓝染艺术风格，创造专属于您的蓝染艺术品
          </p>
          
          {/* 进度指示器 */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>创作进度</span>
              <span>{uploadedImage ? (selectedStyle ? (generatedImage ? "100%" : "66%") : "33%") : "0%"}</span>
            </div>
            <Progress 
              value={uploadedImage ? (selectedStyle ? (generatedImage ? 100 : 66) : 33) : 0} 
              className="h-2 bg-blue-100" 
            />
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={uploadedImage ? "default" : "secondary"} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
              1. 上传图片
            </Badge>
            <div className="h-1 w-4 bg-border"></div>
            <Badge variant={selectedStyle ? "default" : "secondary"} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
              2. 选择风格
            </Badge>
            <div className="h-1 w-4 bg-border"></div>
            <Badge variant={parameters ? "default" : "secondary"} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
              3. 调整参数
            </Badge>
            <div className="h-1 w-4 bg-border"></div>
            <Badge variant={generatedImage ? "default" : "secondary"} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
              4. 生成预览
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="upload" className="text-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  上传
                </TabsTrigger>
                <TabsTrigger value="style" className="text-sm" disabled={!canProceedToStyle}>
                  <Palette className="h-4 w-4 mr-2" />
                  风格
                </TabsTrigger>
                <TabsTrigger value="adjust" className="text-sm" disabled={!canProceedToAdjust}>
                  <Sliders className="h-4 w-4 mr-2" />
                  调整
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-sm" disabled={!canProceedToPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  预览
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <ImageUpload onImageUpload={handleImageUpload} />
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <StyleSelection 
                  onStyleSelect={handleStyleSelect} 
                  uploadedImage={uploadedImage} 
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    上一步
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-4">
                <ParameterAdjustment 
                  parameters={parameters}
                  onParametersChange={handleParametersChange}
                  isGenerating={isGenerating}
                />
                {isGenerating && (
                  <Card className="mb-4">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>AI创作中...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">AI正在分析图像并应用蓝染风格，请稍候...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("style")}>
                    上一步
                  </Button>
                  <Button 
                    onClick={handleGeneratePreview} 
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? "生成中..." : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        生成预览
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <PreviewComparison 
                  originalImage={uploadedImage}
                  generatedImage={generatedImage}
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("adjust")}>
                    返回调整
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleShareCreation}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      分享
                    </Button>
                    <Button 
                      onClick={handleSaveImage}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      保存作品
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden lg:block">
            {activeTab === "preview" && generatedImage && (
              <SaveOperationPanel 
                processedImage={generatedImage}
                onShare={handleShareCreation}
              />
            )}
            {activeTab !== "preview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-blue-500" />
                    AI创作魔法
                  </CardTitle>
                  <CardDescription>
                    探索AI蓝染创作的无限可能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    AI蓝染创作工坊结合了传统蓝染工艺与现代AI技术，让您轻松创造独特的蓝染艺术品。
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3">
                      <h4 className="text-sm font-medium mb-1">10+</h4>
                      <p className="text-xs text-muted-foreground">艺术风格</p>
                    </Card>
                    <Card className="p-3">
                      <h4 className="text-sm font-medium mb-1">5+</h4>
                      <p className="text-xs text-muted-foreground">参数调整</p>
                    </Card>
                    <Card className="p-3">
                      <h4 className="text-sm font-medium mb-1">3种</h4>
                      <p className="text-xs text-muted-foreground">对比模式</p>
                    </Card>
                    <Card className="p-3">
                      <h4 className="text-sm font-medium mb-1">无限</h4>
                      <p className="text-xs text-muted-foreground">创作可能</p>
                    </Card>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="text-xs text-blue-700">
                      完成创作后，您可以将作品应用到实体产品，如T恤、手提袋、装饰画等。
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}