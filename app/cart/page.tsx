"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { CartItem } from "@/components/ui/cart-item"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface CartItemData {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  specs: string
  quantity: number
  selected: boolean
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([
    {
      id: "1",
      name: "手工扎染丝巾",
      price: 168,
      originalPrice: 228,
      image: "/handmade-tie-dye-silk-scarf.jpg",
      specs: "靛蓝色 · 90×90cm",
      quantity: 1,
      selected: true,
    },
    {
      id: "2",
      name: "蓝染棉麻茶席",
      price: 298,
      image: "/indigo-dyed-linen-tea-mat.jpg",
      specs: "经典款 · 30×120cm",
      quantity: 1,
      selected: true,
    },
    {
      id: "3",
      name: "传统蜡染抱枕",
      price: 128,
      originalPrice: 168,
      image: "/traditional-wax-resist-cushion.jpg",
      specs: "花鸟图案 · 45×45cm",
      quantity: 2,
      selected: false,
    },
  ])

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const handleSelectionChange = (id: string, selected: boolean) => {
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, selected } : item)))
  }

  const handleRemove = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const handleSelectAll = (checked: boolean) => {
    setCartItems((items) => items.map((item) => ({ ...item, selected: checked })))
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalSavings = selectedItems.reduce(
    (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0,
  )
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-4 p-4">
            <Link href="/store">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="heading-secondary flex-1">购物车</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center h-96">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">购物车是空的</h3>
          <p className="text-sm text-muted-foreground mb-6">去挑选一些喜欢的商品吧</p>
          <Link href="/store">
            <Button className="bg-primary hover:bg-primary/90">去购物</Button>
          </Link>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/store">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">购物车</h1>
          <span className="text-sm text-muted-foreground">({cartItems.length})</span>
        </div>
      </header>

      {/* Select All */}
      <section className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
          <span className="text-sm font-medium">全选</span>
        </div>
      </section>

      {/* Cart Items */}
      <section className="px-4 space-y-4">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            {...item}
            onQuantityChange={handleQuantityChange}
            onSelectionChange={handleSelectionChange}
            onRemove={handleRemove}
          />
        ))}
      </section>

      {/* Fixed Bottom Checkout */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
            <span className="text-sm">全选</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">合计:</span>
              <span className="text-lg font-bold text-accent">¥{totalPrice}</span>
            </div>
            {totalSavings > 0 && <div className="text-xs text-green-600">已省¥{totalSavings}</div>}
          </div>
        </div>

        <Link href="/checkout">
          <Button className="w-full bg-primary hover:bg-primary/90" disabled={selectedItems.length === 0}>
            结算 ({selectedItems.length})
          </Button>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
