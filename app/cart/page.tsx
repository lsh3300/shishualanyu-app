"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { CheckedState } from "@radix-ui/react-checkbox"
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/hooks/use-cart"

type AdaptedCartItem = {
  id: string
  productId: string
  name: string
  price: number
  image: string
  specs: string
  quantity: number
  selected: boolean
}

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
    refetch,
  } = useCart()

  useEffect(() => {
    const mobileFrame = document.querySelector(".mobile-frame")
    const body = document.body

    mobileFrame?.classList.add("shared-page-fixed-bg")
    body.classList.add("shared-page-fixed-bg")

    return () => {
      mobileFrame?.classList.remove("shared-page-fixed-bg")
      body.classList.remove("shared-page-fixed-bg")
    }
  }, [])

  const cartItems = cartData?.items || []
  const selectedItemsCount = cartItems.filter((item) => item.selected !== false).length
  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected !== false)
  const totalPrice = getTotalPrice()

  const adaptedCartItems: AdaptedCartItem[] = useMemo(
    () =>
      cartItems.map((item) => {
        const product = item.products || {}
        const productImage =
          product.image_url ||
          (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
          "/placeholder.svg"

        return {
          id: item.id,
          productId: item.product_id,
          name: product.name || "未知商品",
          price: product.price || 0,
          image: productImage,
          specs: `${item.color || "默认"} / ${item.size || "默认规格"}`,
          quantity: item.quantity,
          selected: item.selected !== false,
        }
      }),
    [cartItems],
  )

  const header = (
    <ProfileSubpageHeader
      title="购物车"
      subtitle="整理待购商品并完成结算"
      backHref="/profile"
      rightSlot={
        <div className="rounded-full bg-white/72 px-3 py-1 text-[11px] text-[#5d7ca7] shadow-sm ring-1 ring-[#dbe7f5]">
          {totalQuantity} 件
        </div>
      }
    />
  )

  if (!user) {
    return (
      <div className="page-container page-background-home-echo flex flex-col">
        {header}
        <div className="flex flex-1 px-4 py-8">
          <EmptyPanel
            icon={ShoppingCart}
            title="请先登录"
            description="登录后即可查看您加入购物车的商品，并继续结算。"
            href={`/auth?view=login&redirectTo=${encodeURIComponent("/cart")}`}
            cta="立即登录"
          />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container page-background-home-echo flex flex-col">
        {header}
        <div className="flex flex-1 px-4 py-8">
          <div className="flex min-h-[52vh] w-full flex-col items-center justify-center rounded-[24px] bg-white/60 text-center shadow-[0_10px_28px_rgba(61,92,140,0.08)] ring-1 ring-white/70 backdrop-blur-[14px]">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#6a84a9]">正在同步购物车内容</p>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container page-background-home-echo flex flex-col">
        {header}
        <div className="flex flex-1 px-4 py-8">
          <div className="flex min-h-[52vh] w-full flex-col items-center justify-center rounded-[24px] bg-white/68 px-6 text-center shadow-[0_10px_28px_rgba(61,92,140,0.08)] ring-1 ring-white/72 backdrop-blur-[14px]">
            <ShoppingBag className="mb-4 h-12 w-12 text-[#7692b8]" />
            <h3 className="text-lg font-semibold text-[#243d66]">购物车加载失败</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7088ad]">{error}</p>
            <Button className="mt-6 rounded-full px-6" onClick={() => refetch()}>
              重新加载
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (adaptedCartItems.length === 0) {
    return (
      <div className="page-container page-background-home-echo flex flex-col">
        {header}
        <div className="flex flex-1 px-4 py-8">
          <EmptyPanel
            icon={ShoppingBag}
            title="购物车还是空的"
            description="把想买的蓝染好物先放进来，稍后统一结算会更方便。"
            href="/store"
            cta="去逛商品"
          />
        </div>
        <BottomNav />
      </div>
    )
  }

  const handleQuantityChange = async (id: string, quantity: number) => {
    await updateQuantity(id, quantity)
  }

  const handleSelectionChange = (id: string, selected: boolean) => {
    toggleSelection(id, selected)
  }

  const handleRemove = async (id: string) => {
    await removeFromCart(id)
  }

  const handleSelectAll = (checked: CheckedState) => {
    toggleSelectAll(checked === true)
  }

  return (
    <div className="page-container page-background-home-echo flex flex-col pb-[calc(10rem+env(safe-area-inset-bottom,0px))]">
      {header}

      <main className="flex-1 px-4 pb-6">
        <section className="rounded-[26px] bg-[linear-gradient(135deg,rgba(245,250,255,0.88)_0%,rgba(255,255,255,0.72)_100%)] px-4 py-4 shadow-[0_12px_30px_rgba(61,92,140,0.08)] ring-1 ring-white/75 backdrop-blur-[16px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.24em] text-[#7d95b8]">CART SUMMARY</p>
              <h2 className="mt-1 text-[1.1rem] font-semibold text-[#243d66]">
                待结算清单
              </h2>
              <p className="mt-1 text-[12px] text-[#6d85aa]">
                已选 {selectedItemsCount} 件，合计金额可在底部直接结算。
              </p>
            </div>

            <Link href="/store">
              <Button
                variant="outline"
                className="h-10 rounded-full border-[#d8e4f1] bg-white/76 px-4 text-[12px] text-[#355889]"
              >
                继续逛
              </Button>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <SummaryStat label="商品件数" value={String(totalQuantity)} />
            <SummaryStat label="已选商品" value={String(selectedItemsCount)} />
            <SummaryStat label="合计金额" value={`¥${totalPrice.toFixed(2)}`} />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[20px] bg-white/70 px-3 py-3 shadow-sm ring-1 ring-[#e5edf7]">
            <div className="flex items-center gap-3">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              <div>
                <p className="text-[13px] font-medium text-[#243d66]">全选商品</p>
                <p className="text-[11px] text-[#7b93b6]">统一管理结算内容</p>
              </div>
            </div>
            {allSelected ? (
              <div className="flex items-center gap-1 text-[11px] text-[#4c7a5a]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已全部选中
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {adaptedCartItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,251,255,0.74)_100%)] p-3 shadow-[0_12px_28px_rgba(61,92,140,0.08)] backdrop-blur-[12px]"
            >
              <div className="flex gap-3">
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) =>
                      handleSelectionChange(item.id, checked === true)
                    }
                  />
                </div>

                <Link href={`/store/${item.productId}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    usage="card"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-[14px] font-semibold leading-6 text-[#243d66]">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#738db1]">{item.specs}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#e0616f] shadow-sm ring-1 ring-[#eef2f7]"
                      aria-label="移除商品"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#ea7a12]">¥{item.price}</p>
                      <p className="mt-1 text-[10px] text-[#8aa0c2]">
                        小计 ¥{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center overflow-hidden rounded-[14px] border border-[#dde7f2] bg-white/84 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-[#5c789f] disabled:opacity-40"
                        aria-label="减少数量"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex h-9 min-w-[2.8rem] items-center justify-center border-x border-[#dde7f2] text-sm font-medium text-[#243d66]">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-[#5c789f]"
                        aria-label="增加数量"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-[56px] z-40 mx-auto w-full max-w-[420px] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="rounded-[24px] border border-white/80 bg-[rgba(255,255,255,0.92)] p-3 shadow-[0_18px_38px_rgba(40,73,118,0.16)] backdrop-blur-[18px]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#7d95b8]">已选 {selectedItemsCount} 件商品</p>
              <p className="mt-1 text-[1.05rem] font-semibold text-[#243d66]">
                ¥{totalPrice.toFixed(2)}
              </p>
            </div>
            <Link href="/checkout" className="shrink-0">
              <Button
                className="h-11 rounded-full bg-[#1f3f70] px-6 text-white hover:bg-[#193459]"
                disabled={selectedItemsCount === 0}
              >
                去结算
              </Button>
            </Link>
          </div>
          <div className="text-[11px] text-[#7a90b2]">
            支持先调整规格与数量，再统一提交订单。
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white/72 px-3 py-3 text-center shadow-sm ring-1 ring-[#e5edf7]">
      <div className="text-[15px] font-semibold text-[#223f69]">{value}</div>
      <div className="mt-1 text-[10px] text-[#7b93b6]">{label}</div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof ShoppingCart
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <div className="flex min-h-[52vh] w-full flex-col items-center justify-center rounded-[24px] bg-white/68 px-6 text-center shadow-[0_10px_28px_rgba(61,92,140,0.08)] ring-1 ring-white/72 backdrop-blur-[14px]">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] text-[#6d87ad]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#243d66]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#7088ad]">{description}</p>
      <Link href={href}>
        <Button className="mt-6 rounded-full px-6">{cta}</Button>
      </Link>
    </div>
  )
}
