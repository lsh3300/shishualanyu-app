"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Sparkles, ImagePlus, Droplets, ScanSearch, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DyeVatUploadProps {
  onImageUpload: (payload: { previewUrl: string; file: File }) => void
  isUploading?: boolean
}

export default function DyeVatUpload({ onImageUpload, isUploading = false }: DyeVatUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showRipple, setShowRipple] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.match("image.*")) {
      alert("请选择图片文件")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setShowRipple(true)

      setTimeout(() => {
        onImageUpload({
          previewUrl: result,
          file,
        })
      }, 800)
    }
    reader.readAsDataURL(file)
  }, [onImageUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
      <div className="min-w-0">
        <div
          className={cn(
            "relative mx-auto flex min-h-[420px] w-full max-w-[470px] items-center justify-center overflow-hidden rounded-[42px] transition-all duration-500",
            "bg-gradient-to-br from-[#2563eb] via-[#2957d9] to-[#102a60] shadow-[0_30px_80px_rgba(37,99,235,0.28)]",
            dragActive && "scale-[1.02] shadow-[0_36px_100px_rgba(37,99,235,0.38)]",
            isUploading && "animate-pulse",
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={uploadedImage ? undefined : openFileDialog}
        >
          <div className="absolute inset-0">
            <div className="absolute left-0 right-0 top-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent" />
            <div className="absolute inset-x-0 top-[38%] h-px bg-white/18" />
            <div className="absolute inset-x-[10%] bottom-[16%] h-20 rounded-full bg-black/10 blur-3xl" />
          </div>

          <AnimatePresence>
            {(isHovering || dragActive) && !uploadedImage && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-[10%] rounded-[36px] border border-white/20"
                    initial={{ scale: 0.86, opacity: 0 }}
                    animate={{ scale: [0.88, 1.08], opacity: [0.55, 0] }}
                    transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.35 }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRipple && (
              <motion.div
                className="absolute inset-[8%] rounded-[36px] border-4 border-white/70"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.35 }}
                onAnimationComplete={() => setShowRipple(false)}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {uploadedImage ? (
                <motion.div
                  key="uploaded"
                  initial={{ y: -80, opacity: 0, scale: 0.88 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 80, opacity: 0, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className="relative h-[78%] w-[82%] overflow-hidden rounded-[30px] bg-white/10 shadow-2xl"
                >
                  <img src={uploadedImage} alt="已上传图片" className="h-full w-full object-cover" />

                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-3 top-3 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-white"
                >
                  <motion.div
                    animate={{ y: dragActive ? -10 : 0, scale: dragActive ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 280 }}
                  >
                    <Upload className="mx-auto mb-5 h-16 w-16 opacity-95" />
                  </motion.div>

                  <p className="mb-2 text-[2rem] font-medium tracking-wide">
                    {dragActive ? "放入染缸" : "投入蓝染之中"}
                  </p>
                  <p className="text-base text-white/85">点击或拖拽图片到此处</p>
                  <p className="mt-2 text-sm text-white/60">支持 JPG、PNG 格式，单张最大 5MB</p>

                  {!dragActive && (
                    <div className="pointer-events-none absolute inset-0">
                      {[...Array(6)].map((_, i) => {
                        const angle = i * 60
                        const radius = "calc(50% - 26px)"
                        return (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{
                              left: `calc(50% + ${Math.cos((angle * Math.PI) / 180)} * ${radius})`,
                              top: `calc(50% + ${Math.sin((angle * Math.PI) / 180)} * ${radius})`,
                              transform: "translate(-50%, -50%)",
                            }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.45 }}
                          >
                            <Sparkles className="h-4 w-4 text-white/70" />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowTips((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-[22px] border border-blue-100 bg-white/82 px-4 py-3 text-left backdrop-blur-xl"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-800">上传提示</p>
            <p className="text-xs text-slate-500">默认收起，避免挤占主模块</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showTips ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {showTips ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <div className="rounded-[22px] border border-blue-100 bg-white/82 p-3 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2 text-blue-700">
                    <ImagePlus className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">底稿建议</h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">主体清晰、轮廓完整的图片，生成效果会更稳定。</p>
                </div>

                <div className="rounded-[22px] border border-blue-100 bg-white/82 p-3 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2 text-indigo-700">
                    <Droplets className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">适合素材</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    {["人像", "纹样", "器物", "静物"].map((item) => (
                      <span key={item} className="rounded-full bg-slate-50 px-3 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sky-700">
                    <ScanSearch className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">投入状态</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-2xl bg-white/80 px-3 py-3">
                      <p className="text-lg font-bold text-blue-800">{uploadedImage ? "1" : "0"}</p>
                      <p className="mt-1 text-xs text-slate-500">已投图片</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-3 py-3">
                      <p className="text-lg font-bold text-indigo-800">{isUploading ? "处理中" : "待创作"}</p>
                      <p className="mt-1 text-xs text-slate-500">染制状态</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
    </div>
  )
}
