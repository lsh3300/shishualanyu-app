// @ts-nocheck
'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon, Upload } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { FileSelector } from "@/components/ui/file-selector"
import { useFileCache } from "@/hooks/use-file-cache"
import { getProductById, updateProduct, createProduct } from "@/data/models"

interface ProductFormData {
  id?: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  sales: number
  isNew: boolean
  discount?: number
  craftsmanStory: {
    story: string
    author: string
    title: string
  }
  specs: {
    colors: Array<{
      id: string
      label: string
      available: boolean
    }>
    sizes: Array<{
      id: string
      label: string
      available: boolean
    }>
  }
  details: string[]
  stock: number
  status: "active" | "inactive" | "draft"
}

interface ProductEditPageProps {
  params?: {
    id: string
  }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter()
  const { uploadFile } = useFileCache()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isNewProduct, setIsNewProduct] = useState(!params?.id)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    images: [],
    sales: 0,
    isNew: false,
    discount: 0,
    craftsmanStory: {
      story: "",
      author: "",
      title: ""
    },
    specs: {
      colors: [],
      sizes: []
    },
    details: [],
    stock: 0,
    status: "draft"
  })

  // 加载产品数据
  useEffect(() => {
    if (params?.id) {
      setIsLoading(true)
      try {
        const product = getProductById(params.id)
        if (product) {
          setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category || "",
            images: product.images,
            sales: product.sales,
            isNew: product.isNew || false,
            discount: product.discount,
            craftsmanStory: product.craftsmanStory,
            specs: product.specs,
            details: product.details,
            stock: product.stock || 100,
            status: "active"
          })
        } else {
          toast.error("产品不存在")
          router.push("/admin/product-management")
        }
      } catch (error) {
        console.error("加载产品数据失败:", error)
        toast.error("加载产品数据失败")
      } finally {
        setIsLoading(false)
      }
    }
  }, [params?.id, router])

  // 处理表单字段变化
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理嵌套对象字段变化
  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProductFormData],
        [field]: value
      }
    }))
  }

  // 处理文件上传
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      const uploadPromises = files.map(file => 
        uploadFile(file, {
          bucket: "products",
          metadata: {
            product: formData.name || "new-product",
            type: "product-image"
          }
        })
      )

      const results = await Promise.all(uploadPromises)
      const newImages = results.map(result => result.url)
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
      
      toast.success(`成功上传 ${files.length} 张图片`)
    } catch (error) {
      console.error("文件上传失败:", error)
      toast.error("文件上传失败")
    }
  }

  // 处理文件选择
  const handleFileSelect = (selectedFiles: any[]) => {
    const newImages = selectedFiles.map(file => file.url)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // 添加规格选项
  const addSpecOption = (type: "colors" | "sizes") => {
    const newOption = {
      id: Date.now().toString(),
      label: "",
      available: true
    }
    
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [type]: [...prev.specs[type], newOption]
      }
    }))
  }

  // 更新规格选项
  const updateSpecOption = (type: "colors" | "sizes", id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [type]: prev.specs[type].map(option => 
          option.id === id ? { ...option, [field]: value } : option
        )
      }
    }))
  }

  // 删除规格选项
  const removeSpecOption = (type: "colors" | "sizes", id: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [type]: prev.specs[type].filter(option => option.id !== id)
      }
    }))
  }

  // 添加详情项
  const addDetailItem = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, ""]
    }))
  }

  // 更新详情项
  const updateDetailItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map((item, i) => i === index ? value : item)
    }))
  }

  // 删除详情项
  const removeDetailItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }))
  }

  // 保存产品
  const handleSave = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      toast.error("请输入产品名称")
      return
    }
    
    if (!formData.description.trim()) {
      toast.error("请输入产品描述")
      return
    }
    
    if (formData.price <= 0) {
      toast.error("请输入有效的产品价格")
      return
    }
    
    if (formData.images.length === 0) {
      toast.error("请至少上传一张产品图片")
      return
    }

    setIsSaving(true)
    try {
      if (formData.id) {
        // 更新产品
        await updateProduct(formData.id, formData)
        toast.success("产品更新成功")
      } else {
        // 创建产品
        await createProduct(formData)
        toast.success("产品创建成功")
      }
      
      router.push("/admin/product-management")
    } catch (error) {
      console.error("保存产品失败:", error)
      toast.error("保存产品失败")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h1 className="text-xl font-semibold">
              {isNewProduct ? "创建产品" : "编辑产品"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/product-management")}
            >
              取消
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="images">图片管理</TabsTrigger>
            <TabsTrigger value="specs">规格设置</TabsTrigger>
            <TabsTrigger value="details">产品详情</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>设置产品的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">产品名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="请输入产品名称"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">产品分类</Label>
                  <Select value={formData.category} onValueChange={(value) => handleFieldChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择产品分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="textile">纺织品</SelectItem>
                      <SelectItem value="ceramics">陶瓷</SelectItem>
                      <SelectItem value="woodwork">木工</SelectItem>
                      <SelectItem value="jewelry">首饰</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">产品描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="请输入产品描述"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">售价</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">原价</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ""}
                      onChange={(e) => handleFieldChange("originalPrice", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">库存</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sales">销量</Label>
                    <Input
                      id="sales"
                      type="number"
                      value={formData.sales}
                      onChange={(e) => handleFieldChange("sales", Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) => handleFieldChange("isNew", checked)}
                  />
                  <Label htmlFor="isNew">新品</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>匠人故事</CardTitle>
                <CardDescription>添加匠人故事信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">故事标题</Label>
                  <Input
                    id="storyTitle"
                    value={formData.craftsmanStory.title}
                    onChange={(e) => handleNestedFieldChange("craftsmanStory", "title", e.target.value)}
                    placeholder="请输入故事标题"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyAuthor">作者</Label>
                  <Input
                    id="storyAuthor"
                    value={formData.craftsmanStory.author}
                    onChange={(e) => handleNestedFieldChange("craftsmanStory", "author", e.target.value)}
                    placeholder="请输入作者名称"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyContent">故事内容</Label>
                  <Textarea
                    id="storyContent"
                    value={formData.craftsmanStory.story}
                    onChange={(e) => handleNestedFieldChange("craftsmanStory", "story", e.target.value)}
                    placeholder="请输入故事内容"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 图片管理 */}
          <TabsContent value="images" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>产品图片</CardTitle>
                <CardDescription>上传或选择产品图片</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>上传新图片</Label>
                  <FileUpload
                    onFilesChange={handleFileUpload}
                    accept="image/*"
                    multiple={true}
                    maxFiles={10}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>或从已上传的图片中选择</Label>
                  <FileSelector
                    onFilesSelected={handleFileSelect}
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
                
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <Label>已选择的图片 ({formData.images.length})</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-md overflow-hidden">
                            <img
                              src={image}
                              alt={`产品图片 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2" variant="secondary">
                              主图
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 规格设置 */}
          <TabsContent value="specs" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>颜色规格</CardTitle>
                <CardDescription>设置产品的颜色选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.specs.colors.map((color, index) => (
                  <div key={color.id} className="flex items-center gap-2">
                    <Input
                      value={color.label}
                      onChange={(e) => updateSpecOption("colors", color.id, "label", e.target.value)}
                      placeholder="颜色名称"
                      className="flex-1"
                    />
                    <Switch
                      checked={color.available}
                      onCheckedChange={(checked) => updateSpecOption("colors", color.id, "available", checked)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecOption("colors", color.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addSpecOption("colors")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加颜色
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>尺寸规格</CardTitle>
                <CardDescription>设置产品的尺寸选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.specs.sizes.map((size, index) => (
                  <div key={size.id} className="flex items-center gap-2">
                    <Input
                      value={size.label}
                      onChange={(e) => updateSpecOption("sizes", size.id, "label", e.target.value)}
                      placeholder="尺寸名称"
                      className="flex-1"
                    />
                    <Switch
                      checked={size.available}
                      onCheckedChange={(checked) => updateSpecOption("sizes", size.id, "available", checked)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecOption("sizes", size.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addSpecOption("sizes")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加尺寸
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品详情 */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>产品详情</CardTitle>
                <CardDescription>添加产品详情信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={detail}
                      onChange={(e) => updateDetailItem(index, e.target.value)}
                      placeholder="产品详情项"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeDetailItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addDetailItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加详情项
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}