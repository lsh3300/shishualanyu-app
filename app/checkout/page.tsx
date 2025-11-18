"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AddressSelector } from "@/components/ui/address-selector"
import { PaymentMethodSelector } from "@/components/ui/payment-method"
import { ArrowLeft, MapPin, CreditCard, FileText, Gift } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"

const addresses = [
  {
    id: "1",
    name: "张艺术",
    phone: "138****8888",
    address: "江苏省苏州市姑苏区平江路123号",
    isDefault: true,
  },
  {
    id: "2",
    name: "张艺术",
    phone: "138****8888",
    address: "上海市黄浦区南京东路456号",
    isDefault: false,
  },
]

const paymentMethods = [
  {
    id: "alipay",
    name: "支付宝",
    icon: "alipay" as const,
    description: "推荐使用支付宝付款",
  },
  {
    id: "wechat",
    name: "微信支付",
    icon: "wechat" as const,
    description: "使用微信安全支付",
  },
  {
    id: "card",
    name: "银行卡",
    icon: "card" as const,
    description: "储蓄卡、信用卡均可",
  },
]

export default function CheckoutPage() {
  const { cartData } = useCart()
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id)
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id)
  const [couponCode, setCouponCode] = useState("")
  const [remarks, setRemarks] = useState("")

  // 从购物车获取商品数据
  const cartItems = cartData?.items || []
  const orderItems = cartItems.filter(item => item.selected).map(item => ({
    id: item.product_id,
    cartItemId: item.id,
    name: item.products.name,
    price: item.products.price,
    image: item.products.image_url || "/placeholder.svg",
    specs: `${item.color || '默认'} · ${item.size || '默认规格'}`,
    quantity: item.quantity,
  }))

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0 // Free shipping
  const discount = 0 // No coupon applied
  const total = subtotal + shipping - discount

  const handlePlaceOrder = async () => {
    try {
      // 获取选中的购物车商品
      const selectedCartItems = cartItems.filter(item => item.selected)
      
      if (selectedCartItems.length === 0) {
        alert("请选择要结算的商品")
        return
      }
      
      // 准备订单数据
      const orderData = {
        items: selectedCartItems.map(item => ({
          id: item.product_id,
          cartItemId: item.id,
          name: item.products.name,
          price: item.products.price,
          quantity: item.quantity,
          specs: `${item.color || '默认'} · ${item.size || '默认规格'}`,
        })),
        address: addresses.find(addr => addr.id === selectedAddress),
        paymentMethod: paymentMethods.find(method => method.id === selectedPayment)?.name,
        totalAmount: selectedCartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0),
      }
      
      // 调用创建订单API
      const response = await fetch('/api/user/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        // 如果需要更新统计数据，触发全局状态更新
        if (result.statsUpdateRequired) {
          // 这里可以触发全局状态更新，例如通过事件总线或状态管理
          window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
        }
        
        // 跳转到订单成功页面
        window.location.href = "/checkout/success"
      } else {
        alert(result.error || "创建订单失败")
      }
    } catch (error) {
      console.error("提交订单错误:", error)
      alert("提交订单失败，请重试")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">确认订单</h1>
        </div>
      </header>

      {/* Delivery Address */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">收货地址</h3>
        </div>
        <AddressSelector
          addresses={addresses}
          selectedId={selectedAddress}
          onSelect={setSelectedAddress}
          onAddNew={() => {
            // Handle add new address
          }}
        />
      </section>

      <Separator className="mx-4" />

      {/* Order Items */}
      <section className="p-4">
        <h3 className="font-semibold text-foreground mb-4">商品清单</h3>
        <Card className="p-4">
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1 line-clamp-2">{item.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.specs}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                    <span className="font-medium text-accent">¥{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Separator className="mx-4" />

      {/* Coupon */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">优惠券</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="请输入优惠券代码"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">使用</Button>
        </div>
      </section>

      <Separator className="mx-4" />

      {/* Payment Method */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">支付方式</h3>
        </div>
        <PaymentMethodSelector methods={paymentMethods} selectedId={selectedPayment} onSelect={setSelectedPayment} />
      </section>

      <Separator className="mx-4" />

      {/* Remarks */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">订单备注</h3>
        </div>
        <Textarea
          placeholder="如有特殊要求，请在此说明..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="min-h-20"
        />
      </section>

      <Separator className="mx-4" />

      {/* Price Summary */}
      <section className="p-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品小计</span>
              <span>¥{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">运费</span>
              <span className="text-green-600">{shipping === 0 ? "免运费" : `¥${shipping}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">优惠</span>
                <span className="text-green-600">-¥{discount}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>实付款</span>
              <span className="text-accent text-lg">¥{total}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">实付款</div>
            <div className="text-lg font-bold text-accent">¥{total}</div>
          </div>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90" onClick={handlePlaceOrder} disabled={orderItems.length === 0}>
        提交订单 ({orderItems.length})
      </Button>
      </div>

      <BottomNav />
    </div>
  )
}
