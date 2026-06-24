'use client'

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, File, Image, FileText, Video, Music, Archive, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { FileUtils } from "@/lib/file-utils"
import { useFileCache } from "@/hooks/use-file-cache"

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void
  onUploadComplete?: (results: { file: File; url: string }[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
  bucket?: string
  showPreview?: boolean
  autoUpload?: boolean
}

interface UploadingFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function FileUpload({
  onFilesSelected,
  onUploadComplete,
  accept = "*/*",
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = "",
  bucket = "uploads",
  showPreview = true,
  autoUpload = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const { uploadFile } = useFileCache()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [disabled])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return
    
    const files = Array.from(e.target.files)
    processFiles(files)
    
    // 重置input值，以便可以重复选择相同文件
    e.target.value = ""
  }, [disabled])

  const processFiles = useCallback((files: File[]) => {
    // 验证文件数量
    if (maxFiles && files.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 个文件`)
      return
    }
    
    // 验证每个文件
    const validFiles: File[] = []
    const errors: string[] = []
    
    files.forEach(file => {
      // 验证文件大小
      if (maxSize && file.size > maxSize) {
        errors.push(`文件 ${file.name} 超过大小限制 (${FileUtils.formatFileSize(maxSize)})`)
        return
      }
      
      // 验证文件类型
      if (accept !== "*/*") {
        const acceptedTypes = accept.split(",").map(type => type.trim())
        const fileType = file.type
        const fileName = file.name
        const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith(".")) {
            return fileExtension === type
          }
          if (type.includes("*")) {
            const baseType = type.split("/")[0]
            return fileType.startsWith(baseType)
          }
          return fileType === type
        })
        
        if (!isAccepted) {
          errors.push(`文件 ${file.name} 类型不支持`)
          return
        }
      }
      
      validFiles.push(file)
    })
    
    // 显示错误信息
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }
    
    // 如果没有有效文件，直接返回
    if (validFiles.length === 0) return
    
    // 调用回调函数
    if (onFilesSelected) {
      onFilesSelected(validFiles)
    }
    
    // 自动上传
    if (autoUpload) {
      uploadFiles(validFiles)
    }
  }, [maxFiles, maxSize, accept, onFilesSelected, autoUpload, uploadFile])

  const uploadFiles = useCallback(async (files: File[]) => {
    // 初始化上传状态
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles])
    
    // 上传每个文件
    const uploadPromises = newUploadingFiles.map(async (uploadingFile, index) => {
      const fileIndex = uploadingFiles.length + index
      
      try {
        // 更新状态为上传中
        setUploadingFiles(prev => {
          const updated = [...prev]
          updated[fileIndex] = { ...updated[fileIndex], status: 'uploading', progress: 0 }
          return updated
        })
        
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => {
            const updated = [...prev]
            if (updated[fileIndex].status === 'uploading' && updated[fileIndex].progress < 90) {
              updated[fileIndex] = { ...updated[fileIndex], progress: updated[fileIndex].progress + 10 }
            }
            return updated
          })
        }, 200)
        
        // 实际上传文件
        const result = await uploadFile(uploadingFile.file, bucket)
        
        // 清除进度模拟
        clearInterval(progressInterval)
        
        // 更新状态为成功
        setUploadingFiles(prev => {
          const updated = [...prev]
          updated[fileIndex] = { 
            ...updated[fileIndex], 
            status: 'success', 
            progress: 100,
            url: result?.url
          }
          return updated
        })
        
        return { file: uploadingFile.file, url: result?.url || "" }
      } catch (error) {
        // 更新状态为错误
        setUploadingFiles(prev => {
          const updated = [...prev]
          updated[fileIndex] = { 
            ...updated[fileIndex], 
            status: 'error', 
            error: error instanceof Error ? error.message : "上传失败"
          }
          return updated
        })
        
        return null
      }
    })
    
    // 等待所有上传完成
    const results = await Promise.all(uploadPromises)
    const successResults = results.filter(result => result !== null) as { file: File; url: string }[]
    
    // 调用完成回调
    if (onUploadComplete) {
      onUploadComplete(successResults)
    }
    
    // 显示上传结果
    if (successResults.length > 0) {
      toast.success(`成功上传 ${successResults.length} 个文件`)
    }
    
    // 清理上传列表（延迟一段时间，让用户看到成功状态）
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status !== 'success'))
    }, 2000)
  }, [uploadFile, bucket, onUploadComplete])

  const getFileIcon = (file: File) => {
    const type = file.type
    
    if (type.startsWith("image/")) {
      return <Image className="h-4 w-4" />
    } else if (type.startsWith("video/")) {
      return <Video className="h-4 w-4" />
    } else if (type.startsWith("audio/")) {
      return <Music className="h-4 w-4" />
    } else if (type.includes("pdf") || type.includes("document") || type.includes("text")) {
      return <FileText className="h-4 w-4" />
    } else if (type.includes("zip") || type.includes("rar") || type.includes("7z")) {
      return <Archive className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const retryUpload = (index: number) => {
    const file = uploadingFiles[index].file
    removeUploadingFile(index)
    uploadFiles([file])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 拖拽上传区域 */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            {isDragging ? "释放文件以上传" : "拖拽文件到此处或点击上传"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {accept !== "*/*" ? `支持格式: ${accept}` : "支持所有格式"} · 
            {maxSize ? `最大大小: ${FileUtils.formatFileSize(maxSize)}` : ""}
            {maxFiles ? `· 最多文件: ${maxFiles}` : ""}
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={disabled}
          />
          <Button variant="outline" disabled={disabled}>
            选择文件
          </Button>
        </CardContent>
      </Card>

      {/* 上传中的文件列表 */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(uploadingFile.file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {FileUtils.formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="h-1 mt-1" />
                  )}
                </div>
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                  )}
                  {uploadingFile.status === 'uploading' && (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <div className="flex items-center gap-1">
                      <X className="h-4 w-4 text-red-500" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(index)}
                        className="h-6 px-1 text-xs"
                      >
                        重试
                      </Button>
                    </div>
                  )}
                </div>
                {uploadingFile.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadingFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {uploadingFile.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">
                  {uploadingFile.error || "上传失败"}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 文件预览 */}
      {showPreview && uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {uploadingFiles
            .filter(f => f.status === 'success' && f.url && f.file.type.startsWith("image/"))
            .map((uploadingFile, index) => (
              <div key={index} className="relative group">
                <img
                  src={uploadingFile.url}
                  alt={uploadingFile.file.name}
                  className="w-full h-24 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeUploadingFile(uploadingFiles.indexOf(uploadingFile))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}