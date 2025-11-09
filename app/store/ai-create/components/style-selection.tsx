"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StyleOption {
  id: string
  name: string
  description: string
  preview: string
  tags: string[]
}

interface StyleSelectionProps {
  onStyleSelect: (styleId: string) => void
  selectedStyle?: string
  uploadedImage?: string | null
}

const styles: StyleOption[] = [
  {
    id: "classic-indigo",
    name: "经典蓝染",
    description: "传统蓝染工艺风格，深邃的蓝色调与自然纹理",
    preview: "/traditional-indigo-dyeing-master-craftsman.jpg",
    tags: ["传统", "经典", "深邃蓝"]
  },
  {
    id: "shibori-pattern",
    name: "扎染纹理",
    description: "日本扎染工艺，独特的褶皱与染色效果",
    preview: "/handmade-tie-dye-silk-scarf.jpg",
    tags: ["日式", "纹理", "艺术"]
  },
  {
    id: "modern-geometric",
    name: "现代几何",
    description: "结合传统蓝染与现代几何图案的创新风格",
    preview: "/modern-indigo-dyeing-art.jpg",
    tags: ["现代", "几何", "创新"]
  },
  {
    id: "nature-inspired",
    name: "自然元素",
    description: "融入自然元素的蓝染风格，如云纹、水波等",
    preview: "/modern-indigo-dyed-fashion-products.jpg",
    tags: ["自然", "云纹", "水波"]
  },
  {
    id: "minimalist",
    name: "极简主义",
    description: "简约的蓝染风格，强调留白与平衡",
    preview: "/indigo-dyed-linen-tea-mat.jpg",
    tags: ["极简", "留白", "平衡"]
  },
  {
    id: "vintage-wash",
    name: "复古水洗",
    description: "复古水洗效果的蓝染风格，带有岁月痕迹",
    preview: "/traditional-wax-resist-cushion.jpg",
    tags: ["复古", "水洗", "岁月"]
  }
]

export default function StyleSelection({ onStyleSelect, selectedStyle }: StyleSelectionProps) {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageLoad = (styleId: string) => {
    setLoadedImages(prev => new Set(prev).add(styleId))
  }

  const handleImageError = (styleId: string) => {
    setImageErrors(prev => new Set(prev).add(styleId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          选择蓝染风格
        </CardTitle>
        <CardDescription>
          选择您喜欢的蓝染风格，AI将为您生成相应效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {styles.map((style) => (
            <div
              key={style.id}
              className={cn(
                "relative rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md",
                selectedStyle === style.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border"
              )}
              onClick={() => onStyleSelect(style.id)}
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
            >
              <div className="aspect-square rounded-md overflow-hidden bg-muted mb-3 relative">
                {/* 加载占位符 */}
                {!loadedImages.has(style.id) && !imageErrors.has(style.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                
                {/* 错误占位符 */}
                {imageErrors.has(style.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center p-2">
                      <div className="text-muted-foreground text-sm">图片加载失败</div>
                      <div className="text-xs text-muted-foreground mt-1">{style.name}</div>
                    </div>
                  </div>
                )}
                
                {/* 实际图片 */}
                <img
                  src={style.preview}
                  alt={style.name}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    loadedImages.has(style.id) ? "opacity-100" : "opacity-0"
                  )}
                  loading="lazy"
                  onLoad={() => handleImageLoad(style.id)}
                  onError={() => handleImageError(style.id)}
                />
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <h3 className="font-medium mb-1">{style.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {style.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {style.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedStyle && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-center">
              已选择: <span className="font-medium">{styles.find(s => s.id === selectedStyle)?.name}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}