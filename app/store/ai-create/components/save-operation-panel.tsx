"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Share2, 
  Heart, 
  Download, 
  ShoppingCart, 
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useGlobalState } from "@/hooks/use-global-state"

interface SaveOperationPanelProps {
  originalImage?: string
  processedImage?: string
  selectedStyle?: string
  isProcessing?: boolean
  onSave?: (data: {
    title: string
    description: string
    tags: string[]
  }) => void
  onShare?: (platform: string) => void
  onAddToCart?: () => void
  onDownload?: (imageType: 'original' | 'processed') => void
}

export default function SaveOperationPanel({
  originalImage,
  processedImage,
  selectedStyle,
  isProcessing = false,
  onSave,
  onShare,
  onAddToCart,
  onDownload
}: SaveOperationPanelProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const globalState = useGlobalState()
  const [isFavorited, setIsFavorited] = useState(false)
  
  // 初始化时检查是否已收藏
  useEffect(() => {
    if (processedImage) {
      setIsFavorited(globalState.isFavorited(processedImage))
    }
  }, [processedImage, globalState])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (!title.trim()) {
      return
    }
    
    onSave?.({
      title: title.trim(),
      description: description.trim(),
      tags
    })
    setIsSaved(true)
    
    // 3秒后重置保存状态
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleFavorite = () => {
    if (processedImage) {
      if (isFavorited) {
        // 从收藏中移除
        globalState.removeFromFavorites(processedImage);
        setIsFavorited(false);
      } else {
        // 添加到收藏
        globalState.addToFavorites(processedImage);
        setIsFavorited(true);
      }
    }
  }

  const handleShare = (platform: string) => {
    onShare?.(platform)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          保存与操作
        </CardTitle>
        <CardDescription>
          保存您的AI创作，分享给朋友或直接定制产品
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 保存作品 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">作品标题</Label>
            <Input
              id="title"
              placeholder="为您的AI蓝染作品起个名字"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">作品描述</Label>
            <Textarea
              id="description"
              placeholder="描述一下您的创作灵感和想法"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                placeholder="添加标签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={!title.trim() || !processedImage || isProcessing}
          >
            {isSaved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                已保存
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存作品
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* 分享与收藏 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">分享与收藏</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleShare('wechat')}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              微信
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('weibo')}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              微博
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleFavorite}
            className={cn(
              "w-full",
              isFavorited && "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            )}
          >
            <Heart className={cn("h-4 w-4 mr-2", isFavorited && "fill-current")} />
            {isFavorited ? "已收藏" : "收藏作品"}
          </Button>
        </div>

        <Separator />

        {/* 下载选项 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">下载图片</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => onDownload?.('original')}
              disabled={!originalImage}
              className="flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              原图
            </Button>
            <Button
              variant="outline"
              onClick={() => onDownload?.('processed')}
              disabled={!processedImage}
              className="flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              效果图
            </Button>
          </div>
        </div>

        <Separator />

        {/* 定制产品 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">定制产品</h4>
          <p className="text-sm text-muted-foreground">
            将您的AI创作应用到实体产品上，定制独一无二的蓝染作品
          </p>
          <Button onClick={onAddToCart} className="w-full" disabled={!processedImage}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            定制产品
          </Button>
          <Button variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            联系匠人
          </Button>
        </div>

        {!processedImage && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">请先完成AI创作</p>
                <p className="mt-1">上传图片、选择风格并生成效果后，即可使用保存和定制功能</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}