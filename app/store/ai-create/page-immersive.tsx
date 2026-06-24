"use client"

import { useCallback, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  ImageUp,
  SlidersHorizontal,
  Wand2,
  TimerReset,
  ChevronDown,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { toast } from "sonner"

const InkBackground = dynamic(() => import("./components/ink-background"), { ssr: false })
const TraditionalPattern = dynamic(() => import("./components/traditional-pattern"), { ssr: false })
const DyeVatUpload = dynamic(() => import("./components/dye-vat-upload"))
const WorksGallery = dynamic(() => import("./components/works-gallery"))
const StyleSelection = dynamic(() => import("./components/style-selection"))
const ParameterAdjustment = dynamic(() => import("./components/parameter-adjustment"))
const PreviewComparison = dynamic(() => import("./components/preview-comparison"))

const steps = [
  { key: "upload", label: "上传", number: 1 },
  { key: "style", label: "风格", number: 2 },
  { key: "adjust", label: "参数", number: 3 },
  { key: "preview", label: "预览", number: 4 },
] as const

const styleLabels: Record<string, string> = {
  "classic-indigo": "经典蓝染",
  "shibori-pattern": "扎染纹理",
  "modern-geometric": "现代几何",
  "nature-inspired": "自然元素",
  minimalist: "极简主义",
  "vintage-wash": "复古水洗",
}

const pollIntervalMs = 6000
const pollTimeoutMs = 120000

type StepKey = (typeof steps)[number]["key"]

type WorkshopParameters = {
  styleStrength: number
  detailRetention: number
  colorSaturation: number
  textureComplexity: number
  artEffectIntensity: number
}

const defaultParameters: WorkshopParameters = {
  styleStrength: 75,
  detailRetention: 50,
  colorSaturation: 60,
  textureComplexity: 65,
  artEffectIntensity: 70,
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export default function ImmersiveAICreate() {
  const [currentStep, setCurrentStep] = useState<StepKey>("upload")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [parameters, setParameters] = useState(defaultParameters)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [taskId, setTaskId] = useState<string>("")
  const [generationProgress, setGenerationProgress] = useState<string>("待开始")
  const [showCompactPanel, setShowCompactPanel] = useState(false)

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep)
  const selectedStyleLabel = selectedStyle ? styleLabels[selectedStyle] ?? selectedStyle : "未选择"

  const galleryWorks = useMemo(() => {
    if (!generatedImage || !selectedStyle) {
      return []
    }

    return [
      {
        id: "latest-preview",
        originalImage: uploadedImage || generatedImage,
        processedImage: generatedImage,
        style: selectedStyleLabel,
        username: "本次创作",
        createdAt: new Date(),
      },
    ]
  }, [generatedImage, selectedStyle, selectedStyleLabel, uploadedImage])

  const uploadSourceImage = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "product")

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    if (!response.ok || !data?.file?.publicUrl) {
      throw new Error(data?.error || "上传原图失败，请检查存储配置。")
    }

    return data.file.publicUrl as string
  }, [])

  const pollGenerationTask = useCallback(async (currentTaskId: string) => {
    const startedAt = Date.now()

    while (Date.now() - startedAt < pollTimeoutMs) {
      const response = await fetch(`/api/ai-create/status?taskId=${encodeURIComponent(currentTaskId)}`, {
        cache: "no-store",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "查询生成状态失败。")
      }

      setGenerationProgress(data?.progress || (data?.state === "running" ? "处理中" : "排队中"))

      if (data?.isFinal && data?.state === "success" && data?.resultUrl) {
        return data.resultUrl as string
      }

      if (data?.isFinal && data?.state === "failed") {
        throw new Error(data?.error || "AI 生成失败，请稍后重试。")
      }

      await wait(pollIntervalMs)
    }

    throw new Error("生成时间较长，已停止等待，请稍后重试。")
  }, [])

  const handleImageUpload = useCallback((payload: { previewUrl: string; file: File }) => {
    setUploadedImage(payload.previewUrl)
    setSourceFile(payload.file)
    setGeneratedImage(null)
    setTaskId("")
    setGenerationProgress("待开始")
    setShowCompactPanel(false)

    window.setTimeout(() => {
      setCurrentStep("style")
      toast.success("原图已上传，继续选择风格。", {
        duration: 1800,
      })
    }, 500)
  }, [])

  const handleStyleSelect = useCallback((styleId: string) => {
    setSelectedStyle(styleId)
    setCurrentStep("adjust")
    toast.success("风格已锁定，继续调整参数。", {
      duration: 1600,
    })
  }, [])

  const handleGeneratePreview = useCallback(async () => {
    if (!uploadedImage || !selectedStyle || !sourceFile) {
      toast.error("请先上传原图并选择风格。")
      return
    }

    try {
      setIsGenerating(true)
      setGeneratedImage(null)
      setGenerationProgress("上传原图")

      const imageUrl = await uploadSourceImage(sourceFile)

      setGenerationProgress("提交任务")
      const createResponse = await fetch("/api/ai-create/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          styleId: selectedStyle,
          parameters,
        }),
      })

      const createData = await createResponse.json()
      if (!createResponse.ok || !createData?.taskId) {
        throw new Error(createData?.error || "创建 AI 任务失败。")
      }

      const currentTaskId = String(createData.taskId)
      setTaskId(currentTaskId)
      toast("AI 开始生成蓝染效果。", {
        description: "完成后会自动进入预览。",
        duration: 1800,
      })

      const resultUrl = await pollGenerationTask(currentTaskId)
      setGeneratedImage(`/api/ai-create/result?url=${encodeURIComponent(resultUrl)}`)
      setGenerationProgress("生成完成")
      setCurrentStep("preview")
      toast.success("蓝染成品已生成。")
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成失败，请稍后再试。"
      setGenerationProgress("生成失败")
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [parameters, pollGenerationTask, selectedStyle, sourceFile, uploadSourceImage, uploadedImage])

  const handleRestart = useCallback(() => {
    setCurrentStep("upload")
    setUploadedImage(null)
    setSourceFile(null)
    setSelectedStyle(null)
    setGeneratedImage(null)
    setParameters(defaultParameters)
    setTaskId("")
    setGenerationProgress("待开始")
    setShowCompactPanel(false)
    toast.info("已重置，可重新创作。")
  }, [])

  const handleDownload = useCallback(
    (imageType: "original" | "processed") => {
      const imageUrl = imageType === "original" ? uploadedImage : generatedImage
      if (!imageUrl) {
        toast.error("当前没有可下载的图片。")
        return
      }

      const link = document.createElement("a")
      link.href = imageUrl
      link.download = imageType === "original" ? "indigo-original.png" : "indigo-result.png"
      link.click()
      toast.success(imageType === "original" ? "原图已开始下载。" : "成品图已开始下载。")
    },
    [generatedImage, uploadedImage]
  )

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev)
    toast(audioEnabled ? "环境音已关闭" : "环境音已开启", {
      duration: 1000,
    })
  }, [audioEnabled])

  const summaryItems = [
    {
      icon: ImageUp,
      label: "原图",
      value: uploadedImage ? "已上传" : "待上传",
    },
    {
      icon: Wand2,
      label: "风格",
      value: selectedStyleLabel,
    },
    {
      icon: SlidersHorizontal,
      label: "参数",
      value: `${parameters.styleStrength}/${parameters.colorSaturation}/${parameters.textureComplexity}`,
    },
    {
      icon: TimerReset,
      label: "进度",
      value: isGenerating ? generationProgress : generatedImage ? "已完成" : generationProgress,
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <InkBackground />
      <TraditionalPattern />

      <header className="sticky top-0 z-40 border-b border-blue-100/70 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Link href="/store">
                <Button variant="ghost" size="icon" className="mt-1 rounded-full hover:bg-blue-50">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>

              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-[0_12px_28px_rgba(37,99,235,0.2)]">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-[1.3rem] font-bold tracking-tight text-blue-950">AI蓝染创作工坊</h1>
                    <p className="text-sm text-blue-700">上传图片后直接生成蓝染效果</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              className="mt-1 rounded-2xl border-blue-100 bg-white/80 hover:bg-blue-50"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const isCurrent = step.key === currentStep
              const isDone = index < currentStepIndex

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    if (isDone || isCurrent) {
                      setCurrentStep(step.key)
                    }
                  }}
                  className={`rounded-2xl border px-2 py-2 text-center transition-all ${
                    isCurrent
                      ? "border-blue-200 bg-blue-50 shadow-sm"
                      : isDone
                        ? "border-blue-100 bg-white/85"
                        : "border-slate-200/80 bg-white/60"
                  }`}
                >
                  <div
                    className={`mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isDone
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                  </div>
                  <p className={`text-xs font-medium ${isCurrent ? "text-blue-900" : isDone ? "text-blue-700" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-4">
        <section className="rounded-[34px] border border-white/70 bg-white/74 p-3 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-4">
          <AnimatePresence mode="wait">
            {currentStep === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24 }}
              >
                <DyeVatUpload onImageUpload={handleImageUpload} isUploading={isGenerating} />
              </motion.div>
            ) : null}

            {currentStep === "style" && uploadedImage ? (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.24 }}
              >
                <StyleSelection
                  onStyleSelect={handleStyleSelect}
                  uploadedImage={uploadedImage}
                  selectedStyle={selectedStyle || undefined}
                />
              </motion.div>
            ) : null}

            {currentStep === "adjust" ? (
              <motion.div
                key="adjust"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.24 }}
                className="space-y-4"
              >
                <ParameterAdjustment
                  parameters={parameters}
                  onParametersChange={setParameters}
                  isGenerating={isGenerating}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("style")} className="w-full rounded-xl sm:w-auto">
                    返回风格
                  </Button>
                  <Button
                    onClick={handleGeneratePreview}
                    disabled={isGenerating}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                  >
                    {isGenerating ? `生成中 ${generationProgress}` : "开始 AI 生成"}
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {currentStep === "preview" && generatedImage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24 }}
                className="space-y-4"
              >
                <PreviewComparison
                  originalImage={uploadedImage}
                  generatedImage={generatedImage}
                  onRegenerate={() => setCurrentStep("adjust")}
                  onDownload={handleDownload}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("adjust")} className="w-full rounded-xl sm:w-auto">
                    重新调整
                  </Button>
                  <Button
                    onClick={handleRestart}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                  >
                    再来一次
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <div className="mt-3 overflow-hidden rounded-[24px] border border-white/70 bg-white/70 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowCompactPanel((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-900">创作状态</p>
              <p className="text-xs text-slate-500">辅助信息默认折叠，不抢 AI 主模块</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showCompactPanel ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {showCompactPanel ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50/85 px-3 py-3">
                      <div className="mb-1 flex items-center gap-2 text-slate-600">
                        <item.icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                  {taskId ? (
                    <div className="rounded-2xl bg-slate-50/85 px-3 py-3 sm:col-span-2">
                      <p className="text-xs font-medium text-slate-600">任务ID</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{taskId}</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {generatedImage ? (
          <div className="mt-3">
            <WorksGallery works={galleryWorks} />
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  )
}
