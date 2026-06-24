'use client'

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProductDetailTemplate } from "@/components/templates/product-detail-template"
import type { ProductDetailTemplateProps } from "@/components/templates/product-detail-template"
import { useStoreProduct } from "@/hooks/use-store-product"

interface ProductDetailPageProps {
  params?: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const routeParams = useParams<{ id: string }>()
  const productId = params?.id || routeParams?.id
  const { product: rawProduct, loading: isLoading, error } = useStoreProduct(productId)

  const buildCompleteProductData = (productData: Record<string, unknown>): ProductDetailTemplateProps["product"] | null => {
    if (!productData) return null

    const name = typeof productData.name === "string" ? productData.name : "蓝染好物"
    const price = typeof productData.price === "number" ? productData.price : 0
    const description = typeof productData.description === "string" ? productData.description : ""
    const sales = typeof productData.sales === "number" ? productData.sales : 0

    const coverImage = typeof productData.coverImage === "string" ? productData.coverImage : null
    const imageUrl = typeof productData.image_url === "string" ? productData.image_url : null
    const images = Array.isArray(productData.images)
      ? (productData.images as string[])
      : coverImage
        ? [coverImage]
        : imageUrl
          ? [imageUrl]
          : []

    return {
      id: typeof productData.id === "string" ? productData.id : "",
      name,
      price,
      originalPrice: typeof productData.originalPrice === "number" ? productData.originalPrice : undefined,
      images,
      videos: undefined,
      sales,
      isNew: typeof productData.isNew === "boolean" ? productData.isNew : undefined,
      discount: typeof productData.discount === "number" ? productData.discount : undefined,
      description,
      craftsmanStory: (productData.craftsmanStory as ProductDetailTemplateProps["product"]["craftsmanStory"]) || {
        story: "这是一件精心制作的传统工艺品，融合了现代设计与传统技艺，展现了独特的文化魅力。",
        author: "世说蓝语",
        title: "匠心之作"
      },
      specs: (productData.specs as ProductDetailTemplateProps["product"]["specs"]) || {
        colors: [
          { id: "color-1", label: "经典蓝", available: true },
          { id: "color-2", label: "自然白", available: true }
        ],
        sizes: [
          { id: "size-1", label: "均码", available: true }
        ]
      },
      details: (productData.details as string[]) || [
        "精选优质材料，确保产品质量",
        "传统工艺制作，保留文化特色",
        "现代设计理念，符合当代审美",
        "严格品质控制，保证每一件产品都达到高标准"
      ],
    }
  }

  const product = rawProduct ? buildCompleteProductData(rawProduct) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-xl font-bold mb-2">加载数据超时</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            产品数据加载较慢，可能是 Supabase 服务响应延迟或网络问题。
            <br />请检查数据库连接后重试。
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.refresh()}>
              重新加载
            </Button>
            <Button onClick={() => router.push("/store")}>
              返回商店
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">产品不存在</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            您要查看的产品不存在或已被删除。
            <br />请确认产品 ID 是否正确。
          </p>
          <Button onClick={() => router.push("/store")}>
            返回商店
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ProductDetailTemplate product={product} />
  )
}
