"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

interface OrderItem {
  id: string
  image?: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  status: string
  statusText: string
  items: OrderItem[]
  date: string
  total: number
}

// 使用空数组作为默认数据，实际数据应从API获取
const orders: Order[] = []

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "shipping":
      return <Truck className="h-4 w-4 text-blue-500" />
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipping":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">我的订单</h1>
        </div>
      </header>

      {/* Orders List */}
      <section className="p-4 space-y-4">
        {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="text-sm text-muted-foreground">订单号: {order.id}</span>
              </div>
              <Badge className={getStatusColor(order.status)}>{order.statusText}</Badge>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">数量: {item.quantity}</span>
                      <span className="font-medium text-accent">¥{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-sm text-muted-foreground">{order.date}</div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground">总计: ¥{order.total}</span>
                <div className="flex gap-2">
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      再次购买
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                </div>
              </div>
            </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">暂无订单</h3>
          <p className="mt-2 text-sm text-muted-foreground">您还没有任何订单记录</p>
          <Link href="/shop">
            <Button className="mt-4">去逛逛</Button>
          </Link>
        </div>
      )}
        </section>

      <BottomNav />
    </div>
  )
}
