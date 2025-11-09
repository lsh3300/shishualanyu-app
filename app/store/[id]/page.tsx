'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Plus, X, Image as ImageIcon, Upload, Star } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { FileSelector } from "@/components/ui/file-selector"
import { useFileCache } from "@/hooks/use-file-cache"
import { ProductDetailTemplate } from "@/components/templates/product-detail-template"

interface ProductDetailPageProps {
  params?: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const { uploadFile } = useFileCache()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("details")

  // 加载产品数据
  useEffect(() => {
    const productId = params?.id || useParams().id
    if (productId) {
      setIsLoading(true)
      try {
        // 从API获取产品数据
        fetch(`/api/products/${productId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('产品不存在')
            }
            return response.json()
          })
          .then(productData => {
            if (productData) {
              // 确保产品数据包含ProductDetailTemplate组件所需的字段
              const completeProductData = {
                ...productData,
                // 添加缺失的字段，设置默认值
                craftsmanStory: productData.craftsmanStory || {
                  story: "这是一件精心制作的传统工艺品，融合了现代设计与传统技艺，展现了独特的文化魅力。",
                  author: "世说蓝语",
                  title: "匠心之作"
                },
                details: productData.details || [
                  "精选优质材料，确保产品质量",
                  "传统工艺制作，保留文化特色",
                  "现代设计理念，符合当代审美",
                  "严格品质控制，保证每一件产品都达到高标准"
                ],
                specs: productData.specs || {
                  colors: [
                    { id: "color-1", label: "经典蓝", available: true },
                    { id: "color-2", label: "自然白", available: true }
                  ],
                  sizes: [
                    { id: "size-1", label: "均码", available: true }
                  ]
                }
              }
              setProduct(completeProductData)
            } else {
              toast.error("产品不存在")
              router.push("/store")
            }
          })
          .catch(error => {
            console.error("加载产品数据失败:", error)
            toast.error("加载产品数据失败")
            router.push("/store")
          })
          .finally(() => {
            setIsLoading(false)
          })
      } catch (error) {
        console.error("加载产品数据失败:", error)
        toast.error("加载产品数据失败")
        setIsLoading(false)
      }
    }
  }, [params, router, useParams])

  // 处理产品更新
  const handleProductUpdate = async (updatedProduct: any) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      })
      
      if (!response.ok) {
        throw new Error('更新产品失败')
      }
      
      const data = await response.json()
      setProduct(data)
      setIsEditing(false)
      toast.success("产品更新成功")
    } catch (error) {
      console.error("更新产品失败:", error)
      toast.error("更新产品失败")
    } finally {
      setIsSaving(false)
    }
  }

  // 处理图片上传
  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0 || !product) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "products",
        metadata: {
          product: product.name || "unknown-product",
          type: "product-image"
        }
      })
      
      const updatedProduct = {
        ...product,
        images: [...product.images, result.url]
      }
      
      await handleProductUpdate(updatedProduct)
      toast.success("图片上传成功")
    } catch (error) {
      console.error("图片上传失败:", error)
      toast.error("图片上传失败")
    }
  }

  // 处理图片选择
  const handleImageSelect = async (selectedFiles: any[]) => {
    if (selectedFiles.length === 0 || !product) return

    const newImages = selectedFiles.map(file => file.url)
    const updatedProduct = {
      ...product,
      images: [...product.images, ...newImages]
    }
    
    await handleProductUpdate(updatedProduct)
  }

  // 删除图片
  const handleRemoveImage = async (index: number) => {
    if (!product) return

    const updatedProduct = {
      ...product,
      images: product.images.filter((_: any, i: number) => i !== index)
    }
    
    await handleProductUpdate(updatedProduct)
    toast.success("图片删除成功")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">产品不存在</h1>
          <p className="text-muted-foreground mb-4">您要查看的产品不存在或已被删除</p>
          <Button onClick={() => router.push("/store")}>
            返回商店
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">产品详情</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  取消
                </Button>
                <Button 
                  onClick={() => handleProductUpdate(product)}
                  disabled={isSaving}
                >
                  {isSaving ? "保存中..." : "保存"}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">产品详情</TabsTrigger>
            <TabsTrigger value="images">图片管理</TabsTrigger>
            <TabsTrigger value="specs">规格管理</TabsTrigger>
          </TabsList>

          {/* 产品详情 */}
          <TabsContent value="details" className="mt-4">
            <ProductDetailTemplate product={product} />
          </TabsContent>

          {/* 图片管理 */}
          <TabsContent value="images" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>产品图片</CardTitle>
                <CardDescription>管理产品展示图片</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-md overflow-hidden">
                          <img
                            src={image}
                            alt={`产品图片 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2" variant="secondary">
                            主图
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {isEditing && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-2">
                      <Label>上传新图片</Label>
                      <FileUpload
                        onFilesChange={handleImageUpload}
                        accept="image/*"
                        multiple={true}
                        maxFiles={10}
                        maxSize={5 * 1024 * 1024} // 5MB
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>或从已上传的图片中选择</Label>
                      <FileSelector
                        onFilesSelected={handleImageSelect}
                        bucket="products"
                        accept="image"
                        multiple={true}
                        trigger={
                          <Button variant="outline" className="w-full">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            从文件库选择
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 规格管理 */}
          <TabsContent value="specs" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>产品规格</CardTitle>
                <CardDescription>管理产品规格和价格</CardDescription>
              </CardHeader>
              <CardContent>
                {product.specs && product.specs.length > 0 ? (
                  <div className="space-y-4">
                    {product.specs.map((spec: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{spec.name}</h3>
                          <Badge variant="outline">¥{spec.price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{spec.description}</p>
                        <div className="mt-2">
                          <span className="text-sm">库存: {spec.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无产品规格
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
