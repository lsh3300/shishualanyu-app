'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImageIcon, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { adminFetchJson } from '@/lib/admin-fetch'
import { toast } from 'sonner'

type ProductStatus = 'draft' | 'published'

interface ProductRecord {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  images: string[] | null
  in_stock: boolean
  status?: ProductStatus
}

interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  image_url: string
  in_stock: boolean
}

interface ProductEditPageProps {
  params?: {
    id: string
  }
}

const PRODUCT_CATEGORIES = ['丝巾', '包袋', '服装', '家居', '配饰', '材料包']

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  in_stock: true,
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter()
  const productId = params?.id
  const isCreateMode = !productId || productId === 'new'
  const [loading, setLoading] = useState(!isCreateMode)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)

  useEffect(() => {
    if (isCreateMode) return

    const loadProduct = async () => {
      setLoading(true)
      try {
        const response = await adminFetchJson<{ success: boolean; data?: ProductRecord; error?: string }>(
          `/api/admin/products/${productId}`
        )

        if (!response.success || !response.data) {
          throw new Error(response.error || '加载商品失败')
        }

        const product = response.data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          category: product.category || '',
          image_url: product.image_url || product.images?.[0] || '',
          in_stock: product.in_stock !== false,
        })
      } catch (error) {
        console.error('加载商品失败:', error)
        toast.error(error instanceof Error ? error.message : '加载商品失败')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [isCreateMode, productId])

  const previewImage = useMemo(() => formData.image_url.trim(), [formData.image_url])

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('请填写商品名称')
      return
    }

    if (!formData.category.trim()) {
      toast.error('请选择商品分类')
      return
    }

    const numericPrice = Number(formData.price)
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error('请输入有效的商品价格')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: numericPrice,
        category: formData.category.trim(),
        image_url: formData.image_url.trim() || null,
        images: formData.image_url.trim() ? [formData.image_url.trim()] : null,
        in_stock: formData.in_stock,
      }

      const response = await adminFetchJson<{ success: boolean; error?: string }>(
        isCreateMode ? '/api/admin/products' : `/api/admin/products/${productId}`,
        {
          method: isCreateMode ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.success) {
        throw new Error(response.error || '保存商品失败')
      }

      toast.success(isCreateMode ? '商品已创建' : '商品已更新')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('保存商品失败:', error)
      toast.error(error instanceof Error ? error.message : '保存商品失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6f89b0] transition-colors hover:text-[#264268]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回商品列表
        </Link>

        <div className="mt-3 flex flex-col gap-4">
          <div>
            <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">
              {isCreateMode ? 'CREATE PRODUCT' : 'EDIT PRODUCT'}
            </div>
            <h2
              className="mt-1 text-[1.35rem] font-semibold text-[#264268]"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {isCreateMode ? '新增商品' : '编辑商品'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f87aa]">
              先把商品核心信息维护稳定，确保后台在手机框里也能自然完成编辑演示。
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={saving || loading} className="rounded-full sm:w-fit">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            保存商品
          </Button>
        </div>
      </section>

      <div className="grid gap-4">
        <Card className="rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
            <CardDescription>保留答辩演示最重要的字段，先保证后台链路真实可用。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载商品信息...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="product-name">商品名称</Label>
                  <Input
                    id="product-name"
                    value={formData.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="例如：手工蓝染丝巾"
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-category">商品分类</Label>
                    <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                      <SelectTrigger id="product-category" className="rounded-2xl">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-price">价格</Label>
                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(event) => updateField('price', event.target.value)}
                      placeholder="0.00"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">商品描述</Label>
                  <Textarea
                    id="product-description"
                    value={formData.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="简要介绍材质、工艺和使用场景"
                    rows={5}
                    className="rounded-[20px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-image">主图地址</Label>
                  <Input
                    id="product-image"
                    value={formData.image_url}
                    onChange={(event) => updateField('image_url', event.target.value)}
                    placeholder="https://... 或 /images/..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex items-center justify-between rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">库存状态</div>
                    <div className="text-xs text-slate-500">关闭后商品在后台显示为无库存。</div>
                  </div>
                  <Switch checked={formData.in_stock} onCheckedChange={(checked) => updateField('in_stock', checked)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <CardHeader>
            <CardTitle>预览</CardTitle>
            <CardDescription>先把后台最常看的主图和状态信息做清楚。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-[20px] border border-dashed border-slate-300 bg-slate-50">
              {previewImage ? (
                <img src={previewImage} alt={formData.name || '商品预览'} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-2 text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">暂无主图</span>
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-slate-50 px-4 py-3">
              <div className="text-sm font-medium text-slate-900">{formData.name || '未命名商品'}</div>
              <div className="mt-1 text-xs text-slate-500">{formData.category || '未分类'}</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">
                {formData.price ? `¥${Number(formData.price || 0).toFixed(2)}` : '¥0.00'}
              </div>
              <div className="mt-2 text-xs text-slate-500">{formData.in_stock ? '当前状态：有库存' : '当前状态：无库存'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
