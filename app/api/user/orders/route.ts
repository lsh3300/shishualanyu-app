import { NextRequest, NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/server"

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function resolveUserId(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined

  if (!token) {
    return null
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    console.error("Failed to resolve orders user:", error)
    return null
  }

  return data.user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Failed to load orders:", ordersError)
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
    }

    const orders = Array.isArray(ordersData) ? ordersData : []
    const orderIds = orders
      .map((item) => (typeof item.id === "string" ? item.id : null))
      .filter((item): item is string => Boolean(item))

    const { data: orderItemsData, error: orderItemsError } = orderIds.length
      ? await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)
      : { data: [], error: null }

    if (orderItemsError) {
      console.error("Failed to load order items:", orderItemsError)
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
    }

    const orderItems = Array.isArray(orderItemsData) ? orderItemsData : []
    const productIds = Array.from(
      new Set(
        orderItems
          .map((item) => {
            const productId = (item as Record<string, unknown>).product_id
            return typeof productId === "string" && isUuidLike(productId) ? productId : null
          })
          .filter((item): item is string => item !== null),
      ),
    )

    const { data: productsData, error: productsError } = productIds.length
      ? await supabase
          .from("products")
          .select("id, name, image_url, images, category, price")
          .in("id", productIds)
      : { data: [], error: null }

    if (productsError) {
      console.error("Failed to load order products:", productsError)
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
    }

    const productsMap = new Map(
      (Array.isArray(productsData) ? productsData : []).map((item) => [item.id, item]),
    )

    const itemsByOrderId = new Map<string, Array<Record<string, unknown>>>()
    orderItems.forEach((item) => {
      const row = item as Record<string, unknown>
      const orderId = typeof row.order_id === "string" ? row.order_id : null
      const productId = typeof row.product_id === "string" ? row.product_id : null
      if (!orderId) return

      const current = itemsByOrderId.get(orderId) || []
      current.push({
        ...row,
        products: productId ? productsMap.get(productId) || null : null,
      })
      itemsByOrderId.set(orderId, current)
    })

    const hydratedOrders = orders.map((item) => ({
      ...item,
      order_items: itemsByOrderId.get(String(item.id)) || [],
    }))

    const completed = hydratedOrders.filter((item) => {
      const status = typeof item.status === "string" ? item.status : ""
      return status === "delivered" || status === "completed"
    }).length
    const pending = hydratedOrders.filter((item) => {
      const status = typeof item.status === "string" ? item.status : ""
      return status === "pending" || status === "processing"
    }).length

    return NextResponse.json({
      orders: {
        total: hydratedOrders.length,
        completed,
        pending,
        list: hydratedOrders,
      },
    })
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
