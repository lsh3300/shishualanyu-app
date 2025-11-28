"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, ArrowLeft, Plus, Edit, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// 地址类型定义
interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 在客户端渲染完成后，从localStorage获取登录状态和地址数据
  useEffect(() => {
    const savedLoggedInState = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(savedLoggedInState)
    
    // 从localStorage获取地址数据，如果没有则使用默认数据
    if (savedLoggedInState) {
      const savedAddresses = localStorage.getItem('userAddresses')
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses))
      } else {
        // 初始化为空数组，不提供默认地址数据
        setAddresses([])
      }
    }
  }, [])

  // 添加新地址
  const handleAddAddress = (newAddress: Omit<Address, 'id'>) => {
    const newId = `addr${Date.now()}`
    const addressToAdd: Address = {
      ...newAddress,
      id: newId
    }
    
    // 如果设置为默认地址，需要将其他地址设为非默认
    const updatedAddresses = addressToAdd.isDefault 
      ? addresses.map(addr => ({ ...addr, isDefault: false }))
      : [...addresses]
    
    updatedAddresses.push(addressToAdd)
    setAddresses(updatedAddresses)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setIsAddDialogOpen(false)
  }

  // 编辑地址
  const handleEditAddress = (updatedAddress: Address) => {
    // 如果设置为默认地址，需要将其他地址设为非默认
    let updatedAddresses = addresses.map(addr => 
      addr.id === updatedAddress.id 
        ? updatedAddress 
        : updatedAddress.isDefault 
          ? { ...addr, isDefault: false } 
          : addr
    )
    
    setAddresses(updatedAddresses)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
    setIsEditDialogOpen(false)
  }

  // 删除地址
  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id)
    setAddresses(updatedAddresses)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
  }

  // 设置默认地址
  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }))
    
    setAddresses(updatedAddresses)
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses))
  }

  // 如果未登录，显示提示登录界面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-2xl font-bold mt-4">地址管理</h1>
              <p className="text-muted-foreground mt-2">登录后可以管理您的收货地址</p>
            </div>
            <Link href="/profile">
              <Button className="w-full">去登录</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">地址管理</h1>
          </div>
        </div>
      </header>

      {/* 地址列表 */}
      <div className="p-4 space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <Card key={address.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.name}</span>
                    <span className="text-muted-foreground">{address.phone}</span>
                    {address.isDefault && (
                      <Badge variant="outline" className="text-primary border-primary">默认</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingAddress(address)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {!address.isDefault && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    设为默认地址
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">暂无收货地址</p>
          </div>
        )}
      </div>

      {/* 添加地址按钮 */}
      <div className="fixed bottom-20 right-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加新地址</DialogTitle>
            </DialogHeader>
            <AddressForm 
              onSubmit={handleAddAddress} 
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 编辑地址对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑地址</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm 
              initialData={editingAddress}
              onSubmit={handleEditAddress} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 地址表单组件
interface AddressFormProps {
  initialData?: Address
  onSubmit: (address: any) => void
  onCancel: () => void
}

function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
    isDefault: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, isDefault: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">收货人</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">手机号码</Label>
          <Input 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
            pattern="^1[3-9]\d{9}$"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="province">省份</Label>
          <Input 
            id="province" 
            name="province" 
            value={formData.province} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">城市</Label>
          <Input 
            id="city" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">区/县</Label>
          <Input 
            id="district" 
            name="district" 
            value={formData.district} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detail">详细地址</Label>
        <Textarea 
          id="detail" 
          name="detail" 
          value={formData.detail} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="isDefault" 
          checked={formData.isDefault} 
          onCheckedChange={handleSwitchChange} 
        />
        <Label htmlFor="isDefault">设为默认地址</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  )
}