import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle, Home, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Success Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">支付成功</h1>
          <p className="text-muted-foreground">您的订单已提交，我们会尽快为您处理</p>
        </div>

        <Card className="w-full max-w-sm p-6 mb-8">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">订单号</div>
            <div className="font-mono text-lg font-semibold">20241201001</div>
            <div className="text-sm text-muted-foreground">支付金额</div>
            <div className="text-2xl font-bold text-accent">¥466</div>
          </div>
        </Card>

        <div className="w-full max-w-sm space-y-3">
          <Link href="/profile/orders" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Package className="h-4 w-4 mr-2" />
              查看订单
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
