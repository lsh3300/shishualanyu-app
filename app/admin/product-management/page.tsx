'use client'

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Trash2, Edit, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/ui/file-upload"
import { FileViewer } from "@/components/ui/file-viewer"
import { useFileCache } from "@/hooks/use-file-cache"
import { FileUtils } from "@/lib/file-utils"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  sales: number
  isNew?: boolean
  discount?: number
  description: string
  in_stock: boolean
  craftsmanStory?: {
    story: string
    author: string
    title: string
  }
  specs?: {
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
}

export default function ProductManagementPage() {
  const router = useRouter()
  const { getFileUrl, uploadFile, deleteFile } = useFileCache()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("list")
  const [isEditing, setIsEditing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    in_stock: true,
    isNew: false,
    craftsmanStory: "",
    craftsmanAuthor: "",
    details: [""]
  })

  // 颜色和规格
  const [colors, setColors] = useState([{ id: "", label: "", available: true }])
  const [sizes, setSizes] = useState([{ id: "", label: "", available: true }])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // 这里应该调用实际的API获取产品列表
      // 暂时使用模拟数据
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "手工扎染丝巾",
          price: 168,
          originalPrice: 228,
          images: ["/placeholder.svg"],
          category: "丝巾",
          sales: 234,
          isNew: true,
          discount: 26,
          description: "采用传统扎染工艺，每一条丝巾都是独一无二的艺术品。",
          in_stock: true,
          details: ["材质：100%桑蚕丝", "工艺：传统手工扎染", "产地：江南水乡"]
        },
        {
          id: "2",
          name: "扎染帆布包",
          price: 128,
          images: ["/placeholder.svg"],
          category: "包袋",
          sales: 456,
          description: "实用与艺术结合的帆布包，采用环保材料，手工扎染图案。",
          in_stock: true,
          details: ["材质：环保帆布", "工艺：手工扎染", "尺寸：35×40cm"]
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error("获取产品列表失败:", error)
      toast.error("获取产品列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      in_stock: product.in_stock,
      isNew: product.isNew || false,
      craftsmanStory: product.craftsmanStory?.story || "",
      craftsmanAuthor: product.craftsmanStory?.author || "",
      details: product.details.length > 0 ? product.details : [""]
    })
    
    if (product.specs) {
      setColors(product.specs.colors.length > 0 ? product.specs.colors : [{ id: "", label: "", available: true }])
      setSizes(product.specs.sizes.length > 0 ? product.specs.sizes : [{ id: "", label: "", available: true }])
    }
    
    setUploadedImages(product.images)
    setIsEditing(true)
    setActiveTab("edit")
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("确定要删除这个产品吗？")) {
      try {
        // 这里应该调用实际的API删除产品
        setProducts(products.filter(p => p.id !== id))
        toast.success("产品删除成功")
      } catch (error) {
        console.error("删除产品失败:", error)
        toast.error("删除产品失败")
      }
    }
  }

  const handleImageUpload = async (files: File[]) => {
    setIsUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const isValid = FileUtils.validateImageFile(file)
        if (!isValid) {
          toast.error(`文件 ${file.name} 不是有效的图片文件`)
          return null
        }
        
        const result = await uploadFile(file, "products")
        return result?.url || null
      })
      
      const results = await Promise.all(uploadPromises)
      const validUrls = results.filter(url => url !== null) as string[]
      
      setUploadedImages(prev => [...prev, ...validUrls])
      toast.success(`成功上传 ${validUrls.length} 张图片`)
    } catch (error) {
      console.error("上传图片失败:", error)
      toast.error("上传图片失败")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = uploadedImages[index]
    try {
      await deleteFile(imageUrl)
      setUploadedImages(prev => prev.filter((_, i) => i !== index))
      toast.success("图片删除成功")
    } catch (error) {
      console.error("删除图片失败:", error)
      toast.error("删除图片失败")
    }
  }

  const handleSaveProduct = async () => {
    try {
      const productData: Product = {
        id: currentProduct?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        images: uploadedImages,
        category: formData.category,
        sales: currentProduct?.sales || 0,
        isNew: formData.isNew,
        discount: formData.originalPrice && formData.originalPrice > formData.price 
          ? Math.round((1 - formData.price / formData.originalPrice) * 100) 
          : undefined,
        in_stock: formData.in_stock,
        craftsmanStory: formData.craftsmanStory ? {
          story: formData.craftsmanStory,
          author: formData.craftsmanAuthor,
          title: "匠人说"
        } : undefined,
        specs: {
          colors: colors.filter(c => c.label !== ""),
          sizes: sizes.filter(s => s.label !== "")
        },
        details: formData.details.filter(d => d !== "")
      }

      if (isEditing && currentProduct) {
        // 更新产品
        setProducts(prev => prev.map(p => p.id === currentProduct.id ? productData : p))
        toast.success("产品更新成功")
      } else {
        // 创建新产品
        setProducts(prev => [...prev, productData])
        toast.success("产品创建成功")
      }

      // 重置表单
      resetForm()
      setActiveTab("list")
    } catch (error) {
      console.error("保存产品失败:", error)
      toast.error("保存产品失败")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      in_stock: true,
      isNew: false,
      craftsmanStory: "",
      craftsmanAuthor: "",
      details: [""]
    })
    setColors([{ id: "", label: "", available: true }])
    setSizes([{ id: "", label: "", available: true }])
    setUploadedImages([])
    setCurrentProduct(null)
    setIsEditing(false)
  }

  const addColor = () => {
    setColors([...colors, { id: Date.now().toString(), label: "", available: true }])
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: string, value: any) => {
    setColors(colors.map((c, i) => 
      i === index ? { ...c, [field]: value } : c
    ))
  }

  const addSize = () => {
    setSizes([...sizes, { id: Date.now().toString(), label: "", available: true }])
  }

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index))
  }

  const updateSize = (index: number, field: string, value: any) => {
    setSizes(sizes.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    ))
  }

  const addDetail = () => {
    setFormData({ ...formData, details: [...formData.details, ""] })
  }

  const updateDetail = (index: number, value: string) => {
    setFormData({
      ...formData,
      details: formData.details.map((d, i) => i === index ? value : d)
    })
  }

  const removeDetail = (index: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">产品管理</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              resetForm()
              setActiveTab("edit")
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加产品
          </Button>
        </div>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">产品列表</TabsTrigger>
            <TabsTrigger value="edit">编辑产品</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p>加载中...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p>暂无产品数据</p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    resetForm()
                    setActiveTab("edit")
                  }}
                >
                  添加第一个产品
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.images.length > 0 && (
                            <FileViewer
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium truncate">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {product.isNew && (
                                <Badge variant="destructive" className="text-xs">新品</Badge>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {product.in_stock ? "有库存" : "无库存"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">¥{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">¥{product.originalPrice}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "编辑产品" : "添加新产品"}</CardTitle>
                <CardDescription>
                  {isEditing ? "更新产品信息。" : "填写产品详细信息。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">基本信息</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">产品名称</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="输入产品名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">产品分类</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择产品分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="丝巾">丝巾</SelectItem>
                          <SelectItem value="包袋">包袋</SelectItem>
                          <SelectItem value="服装">服装</SelectItem>
                          <SelectItem value="家居">家居</SelectItem>
                          <SelectItem value="配饰">配饰</SelectItem>
                          <SelectItem value="材料包">材料包</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">产品描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="输入产品描述"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* 价格信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">价格信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">售价 (¥)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">原价 (¥)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* 产品图片 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">产品图片</h3>
                  <FileUpload
                    onFilesSelected={handleImageUpload}
                    accept="image/*"
                    multiple={true}
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024} // 5MB
                    disabled={isUploading}
                    className="w-full"
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <FileViewer
                              src={url}
                              alt={`产品图片 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 产品规格 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">产品规格</h3>
                  
                  {/* 颜色选项 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>颜色选项</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addColor}>
                        <Plus className="h-4 w-4 mr-1" />
                        添加颜色
                      </Button>
                    </div>
                    {colors.map((color, index) => (
                      <div key={color.id || index} className="flex items-center gap-2">
                        <Input
                          placeholder="颜色名称"
                          value={color.label}
                          onChange={(e) => updateColor(index, "label", e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`color-available-${index}`} className="text-sm">可用</Label>
                          <input
                            id={`color-available-${index}`}
                            type="checkbox"
                            checked={color.available}
                            onChange={(e) => updateColor(index, "available", e.target.checked)}
                          />
                        </div>
                        {colors.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeColor(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* 尺寸选项 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>尺寸选项</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addSize}>
                        <Plus className="h-4 w-4 mr-1" />
                        添加尺寸
                      </Button>
                    </div>
                    {sizes.map((size, index) => (
                      <div key={size.id || index} className="flex items-center gap-2">
                        <Input
                          placeholder="尺寸名称"
                          value={size.label}
                          onChange={(e) => updateSize(index, "label", e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`size-available-${index}`} className="text-sm">可用</Label>
                          <input
                            id={`size-available-${index}`}
                            type="checkbox"
                            checked={size.available}
                            onChange={(e) => updateSize(index, "available", e.target.checked)}
                          />
                        </div>
                        {sizes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSize(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 匠人故事 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">匠人故事</h3>
                  <div className="space-y-2">
                    <Label htmlFor="craftsmanAuthor">匠人姓名</Label>
                    <Input
                      id="craftsmanAuthor"
                      value={formData.craftsmanAuthor}
                      onChange={(e) => setFormData({ ...formData, craftsmanAuthor: e.target.value })}
                      placeholder="输入匠人姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="craftsmanStory">匠人故事</Label>
                    <Textarea
                      id="craftsmanStory"
                      value={formData.craftsmanStory}
                      onChange={(e) => setFormData({ ...formData, craftsmanStory: e.target.value })}
                      placeholder="输入匠人故事"
                      rows={3}
                    />
                  </div>
                </div>

                {/* 产品详情 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">产品详情</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                      <Plus className="h-4 w-4 mr-1" />
                      添加详情
                    </Button>
                  </div>
                  {formData.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="输入产品详情"
                        value={detail}
                        onChange={(e) => updateDetail(index, e.target.value)}
                      />
                      {formData.details.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDetail(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 其他选项 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">其他选项</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      id="in_stock"
                      type="checkbox"
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    />
                    <Label htmlFor="in_stock">有库存</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="is_new"
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    <Label htmlFor="is_new">新品</Label>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                  <Button onClick={handleSaveProduct} disabled={!formData.name || !formData.price || uploadedImages.length === 0}>
                    <Save className="h-4 w-4 mr-1" />
                    保存产品
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}