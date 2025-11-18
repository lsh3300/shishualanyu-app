"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CartItem } from "@/components/ui/cart-item"
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function CartPage() {
  const { user } = useAuth()
  const {
    cartData,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    toggleSelection,
    toggleSelectAll,
    getTotalPrice,
    refetch
  } = useCart()

  // 如果用户未登录，显示登录提示
  if (!user) {
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
          <h3 className="text-lg font-medium text-foreground mb-2">请先登录</h3>
          <p className="text-sm text-muted-foreground mb-6">登录后即可查看购物车</p>
          <Link href="/auth">
            <Button className="bg-primary hover:bg-primary/90">去登录</Button>
          </Link>
        </div>

        <BottomNav />
      </div>
    )
  }

  // 加载状态
  if (loading) {
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
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">加载购物车数据...</p>
        </div>

        <BottomNav />
      </div>
    )
  }

  // 错误状态
  if (error) {
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
          <h3 className="text-lg font-medium text-foreground mb-2">加载失败</h3>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button onClick={refetch} className="bg-primary hover:bg-primary/90">
            重新加载
          </Button>
        </div>

        <BottomNav />
      </div>
    )
  }

  const cartItems = cartData?.items || []
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected)

  // 转换数据格式以适配CartItem组件
  const adaptedCartItems = cartItems.map((item) => ({
    id: item.id,
    name: item.products.name,
    price: item.products.price,
    image: item.products.image_url || "/placeholder.svg",
    specs: `${item.color || '默认'} · ${item.size || '默认规格'}`,
    quantity: item.quantity,
    selected: item.selected || false, // 如果API没有selected字段，默认false
  }))

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

  // 处理函数
  const handleQuantityChange = async (id: string, quantity: number) => {
    await updateQuantity(id, quantity)
  }

  const handleSelectionChange = (id: string, selected: boolean) => {
    toggleSelection(id, selected)
  }

  const handleRemove = async (id: string) => {
    await removeFromCart(id)
  }

  const handleSelectAll = (checked: boolean) => {
    toggleSelectAll(checked)
  }

  const totalPrice = getTotalPrice()

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
        {adaptedCartItems.map((item) => (
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
              <span className="text-lg font-bold text-accent">¥{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link href="/checkout">
          <Button className="w-full bg-primary hover:bg-primary/90" disabled={cartItems.filter(item => item.selected).length === 0}>
            结算 ({cartItems.filter(item => item.selected).length})
          </Button>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
