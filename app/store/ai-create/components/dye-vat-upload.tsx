"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DyeVatUploadProps {
  onImageUpload: (imageData: string) => void
  isUploading?: boolean
}

/**
 * 染缸式上传组件
 * 设计理念：让用户感觉像是把图片"投入"染缸中
 * 视觉：圆形染缸，深蓝渐变，波纹动画
 * 交互：拖拽、点击、沉入动画
 */
export default function DyeVatUpload({ onImageUpload, isUploading = false }: DyeVatUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showRipple, setShowRipple] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 拖拽处理
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

  // 文件处理
  const handleFile = useCallback((file: File) => {
    if (!file.type.match('image.*')) {
      alert('请选择图片文件')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setShowRipple(true)
      
      // 延迟调用回调，让动画完成
      setTimeout(() => {
        onImageUpload(result)
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
      fileInputRef.current.value = ''
    }
  }, [])

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-[500px]">
      {/* 染缸容器 */}
      <div
        className={cn(
          "relative w-[400px] h-[400px] rounded-full transition-all duration-500",
          "cursor-pointer group",
          isUploading && "animate-pulse"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={uploadedImage ? undefined : openFileDialog}
      >
        {/* 染缸背景 - 深蓝渐变 */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900",
          dragActive && "scale-105 shadow-2xl shadow-blue-500/50",
          isHovering && !uploadedImage && "scale-102"
        )}>
          {/* 水面光效 */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1/3",
              "bg-gradient-to-b from-white/20 to-transparent",
              "animate-dye-vat-shimmer"
            )} />
          </div>

          {/* 波纹动画层 */}
          <AnimatePresence>
            {(isHovering || dragActive) && !uploadedImage && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [0.8, 1.2],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* 涟漪效果（拖拽或上传时） */}
          <AnimatePresence>
            {showRipple && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                onAnimationComplete={() => setShowRipple(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 内容区 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {uploadedImage ? (
              // 已上传图片
              <motion.div
                key="uploaded"
                initial={{ y: -100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="relative w-4/5 h-4/5 rounded-full overflow-hidden shadow-2xl"
              >
                <img
                  src={uploadedImage}
                  alt="上传的图片"
                  className="w-full h-full object-cover"
                />
                
                {/* 删除按钮 */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* 水珠效果（装饰） */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/60 rounded-full"
                    style={{
                      top: `${10 + i * 15}%`,
                      right: `${20 + i * 5}%`,
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: [0, 1, 0], y: [0, 20, 40] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              // 上传提示
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-white z-10"
              >
                <motion.div
                  animate={{
                    y: dragActive ? -10 : 0,
                    scale: dragActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 opacity-90" />
                </motion.div>
                
                <motion.div
                  animate={{
                    opacity: dragActive ? 0 : 1,
                  }}
                >
                  <p className="text-xl font-medium mb-2">
                    {dragActive ? "放入染缸" : "投入蓝染之中"}
                  </p>
                  <p className="text-sm opacity-80">
                    点击或拖拽图片到此处
                  </p>
                  <p className="text-xs opacity-60 mt-2">
                    支持 JPG、PNG 格式 · 最大 5MB
                  </p>
                </motion.div>

                {/* Sparkles装饰 */}
                {!dragActive && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${30 + Math.cos(i * 60 * Math.PI / 180) * 120}px`,
                          top: `${200 + Math.sin(i * 60 * Math.PI / 180) * 120}px`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-white" />
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* 辅助文字 */}
      {!uploadedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 text-center"
        >
          <p className="text-sm text-muted-foreground">
            💡 提示：选择光线充足、主体清晰的照片效果更佳
          </p>
        </motion.div>
      )}
    </div>
  )
}
