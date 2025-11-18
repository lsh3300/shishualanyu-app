import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// 测试用户ID，实际应用中应该从认证中获取
const TEST_USER_ID = "test-user-id"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // 解析请求数据
    const { items, address, paymentMethod, totalAmount } = await request.json()
    
    // 验证请求数据
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "订单商品不能为空" },
        { status: 400 }
      )
    }
    
    if (!address) {
      return NextResponse.json(
        { error: "收货地址不能为空" },
        { status: 400 }
      )
    }
    
    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: TEST_USER_ID,
        status: "pending",
        total_amount: totalAmount,
        shipping_address: address,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (orderError) {
      console.error("创建订单失败:", orderError)
      return NextResponse.json(
        { error: "创建订单失败" },
        { status: 500 }
      )
    }
    
    // 创建订单商品项
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      specs: item.specs || "",
    }))
    
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
    
    if (itemsError) {
      console.error("创建订单商品失败:", itemsError)
      // 回滚订单创建
      await supabase.from("orders").delete().eq("id", order.id)
      
      return NextResponse.json(
        { error: "创建订单商品失败" },
        { status: 500 }
      )
    }
    
    // 清空购物车中已结算的商品
    const cartItemIds = items.map((item: any) => item.cartItemId).filter(Boolean)
    if (cartItemIds.length > 0) {
      await supabase
        .from("cart_items")
        .delete()
        .in("id", cartItemIds)
    }
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      statsUpdateRequired: true, // 标记需要更新统计数据
    })
  } catch (error) {
    console.error("创建订单错误:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  }
}