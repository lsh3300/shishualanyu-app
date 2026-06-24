"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

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
  return (
    <Card className="rounded-[30px] border-blue-100 bg-white/84 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          选择蓝染风格
        </CardTitle>
        <CardDescription>
          先确定这轮作品的整体气质。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((style) => (
            <div
              key={style.id}
              className={cn(
                "relative cursor-pointer rounded-[24px] border p-3 transition-all hover:-translate-y-1 hover:shadow-md",
                selectedStyle === style.id 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border bg-white"
              )}
              onClick={() => onStyleSelect(style.id)}
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-[18px] bg-muted">
                <OptimizedImage
                  src={style.preview}
                  alt={style.name}
                  fill
                  usage="card"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 260px"
                  className="object-cover"
                />
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <h3 className="mb-1 font-medium">{style.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
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
          <div className="mt-6 rounded-[22px] bg-primary/5 p-4">
            <p className="text-center text-sm">
              已选择: <span className="font-medium">{styles.find(s => s.id === selectedStyle)?.name}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
