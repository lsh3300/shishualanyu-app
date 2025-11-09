"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AdminRoute } from "@/components/auth/admin-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Trash2, Edit, Plus, Save } from "lucide-react"

// 产品类型定义
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  in_stock: boolean
  created_at: string
  updated_at: string
}

// 模拟初始产品数据
const initialProducts: Product[] = [
  {
    id: "1",
    name: "手工扎染丝巾",
    description: "采用传统扎染工艺，每一条丝巾都是独一无二的艺术品。选用优质桑蚕丝，手感柔滑，色彩自然渐变。",
    price: 168,
    category: "丝巾",
    image_url: "/handmade-tie-dye-silk-scarf.jpg",
    in_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "扎染帆布包",
    description: "实用与艺术结合的帆布包，采用环保材料，手工扎染图案，适合日常使用。",
    price: 128,
    category: "包包",
    image_url: "/placeholder.svg",
    in_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "扎染T恤",
    description: "纯棉T恤，结合传统扎染工艺，每件都是独一无二的艺术品，舒适透气，适合日常穿着。",
    price: 98,
    category: "服装",
    image_url: "/placeholder.svg",
    in_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function DataManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    in_stock: true
  })

  // 获取所有产品
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products || [])
      } else {
        toast.error(data.error || '获取产品失败')
      }
    } catch (error) {
      console.error('获取产品失败:', error)
      toast.error('获取产品失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载产品
  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    }))
  }

  // 处理选择变化
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理开关变化
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      image_url: "",
      in_stock: true
    })
  }

  // 创建新产品
  const handleCreateProduct = async () => {
    if (!formData.name || !formData.category) {
      toast.error("请填写产品名称和类别")
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        fetchProducts() // 重新获取产品列表
        resetForm()
        setIsCreateDialogOpen(false)
        toast.success("产品创建成功")
      } else {
        toast.error(data.error || '创建产品失败')
      }
    } catch (error) {
      console.error('创建产品失败:', error)
      toast.error('创建产品失败')
    }
  }

  // 编辑产品
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      image_url: product.image_url || "",
      in_stock: product.in_stock
    })
    setIsEditDialogOpen(true)
  }

  // 更新产品
  const handleUpdateProduct = async () => {
    if (!currentProduct || !formData.name || !formData.category) {
      toast.error("请填写产品名称和类别")
      return
    }

    try {
      const response = await fetch(`/api/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        fetchProducts() // 重新获取产品列表
        resetForm()
        setIsEditDialogOpen(false)
        setCurrentProduct(null)
        toast.success("产品更新成功")
      } else {
        toast.error(data.error || '更新产品失败')
      }
    } catch (error) {
      console.error('更新产品失败:', error)
      toast.error('更新产品失败')
    }
  }

  // 删除产品
  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        fetchProducts() // 重新获取产品列表
        toast.success("产品删除成功")
      } else {
        toast.error(data.error || '删除产品失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      toast.error('删除产品失败')
    }
  }

  // 如果用户未登录，显示加载状态
  if (!user) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>
  }

  return (
    <AdminRoute>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">数据管理示例</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              添加产品
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加新产品</DialogTitle>
              <DialogDescription>
                填写产品信息以创建新产品。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  类别
                </Label>
                <Select onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="丝巾">丝巾</SelectItem>
                    <SelectItem value="包包">包包</SelectItem>
                    <SelectItem value="服装">服装</SelectItem>
                    <SelectItem value="家居">家居</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  价格
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  描述
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">
                  图片URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="in_stock" className="text-right">
                  库存状态
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => handleSwitchChange("in_stock", checked)}
                  />
                  <Label htmlFor="in_stock">{formData.in_stock ? "有库存" : "无库存"}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateProduct}>
                创建产品
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>产品列表</CardTitle>
          <CardDescription>
            这里展示了基本的增删改查操作示例。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>库存状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      暂无产品数据
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>¥{product.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.in_stock ? "有库存" : "无库存"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑产品对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑产品</DialogTitle>
            <DialogDescription>
              更新产品信息。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                名称
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                类别
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="丝巾">丝巾</SelectItem>
                  <SelectItem value="包包">包包</SelectItem>
                  <SelectItem value="服装">服装</SelectItem>
                  <SelectItem value="家居">家居</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                价格
              </Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                描述
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image_url" className="text-right">
                图片URL
              </Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-in_stock" className="text-right">
                库存状态
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => handleSwitchChange("in_stock", checked)}
                />
                <Label htmlFor="edit-in_stock">{formData.in_stock ? "有库存" : "无库存"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateProduct}>
              <Save className="mr-2 h-4 w-4" />
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminRoute>
  )
}