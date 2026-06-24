'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminFetchJson } from '@/lib/admin-fetch'
import { toast } from 'sonner'

interface CourseRecord {
  id: string
  title: string
  description: string | null
  instructor: string
  duration: number
  price: number
  image_url: string | null
  category: string
}

interface CourseFormData {
  title: string
  description: string
  instructor: string
  duration: string
  price: string
  image_url: string
  category: string
}

interface CourseEditPageProps {
  params?: {
    id: string
  }
}

const COURSE_CATEGORIES = ['蜡染', '扎染', '刺绣', '编织', '陶艺', '木工', '剪纸', '其他']

const emptyForm: CourseFormData = {
  title: '',
  description: '',
  instructor: '',
  duration: '',
  price: '',
  image_url: '',
  category: '',
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const router = useRouter()
  const courseId = params?.id
  const isCreateMode = !courseId || courseId === 'new'
  const [loading, setLoading] = useState(!isCreateMode)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>(emptyForm)

  useEffect(() => {
    if (isCreateMode) return

    const loadCourse = async () => {
      setLoading(true)
      try {
        const response = await adminFetchJson<{ success: boolean; data?: CourseRecord; error?: string }>(
          `/api/admin/courses/${courseId}`
        )

        if (!response.success || !response.data) {
          throw new Error(response.error || '加载课程失败')
        }

        const course = response.data
        setFormData({
          title: course.title || '',
          description: course.description || '',
          instructor: course.instructor || '',
          duration: String(course.duration ?? ''),
          price: String(course.price ?? ''),
          image_url: course.image_url || '',
          category: course.category || '',
        })
      } catch (error) {
        console.error('加载课程失败:', error)
        toast.error(error instanceof Error ? error.message : '加载课程失败')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, isCreateMode])

  const previewImage = useMemo(() => formData.image_url.trim(), [formData.image_url])

  const updateField = <K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('请填写课程标题')
      return
    }

    if (!formData.instructor.trim()) {
      toast.error('请填写讲师名称')
      return
    }

    if (!formData.category.trim()) {
      toast.error('请选择课程分类')
      return
    }

    const duration = Number(formData.duration)
    if (!Number.isFinite(duration) || duration < 0) {
      toast.error('请输入有效的课程时长')
      return
    }

    const price = Number(formData.price)
    if (!Number.isFinite(price) || price < 0) {
      toast.error('请输入有效的课程价格')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        instructor: formData.instructor.trim(),
        duration,
        price,
        image_url: formData.image_url.trim() || null,
        category: formData.category.trim(),
      }

      const response = await adminFetchJson<{ success: boolean; error?: string }>(
        isCreateMode ? '/api/admin/courses' : `/api/admin/courses/${courseId}`,
        {
          method: isCreateMode ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.success) {
        throw new Error(response.error || '保存课程失败')
      }

      toast.success(isCreateMode ? '课程已创建' : '课程已更新')
      router.push('/admin/courses')
      router.refresh()
    } catch (error) {
      console.error('保存课程失败:', error)
      toast.error(error instanceof Error ? error.message : '保存课程失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6f89b0] transition-colors hover:text-[#264268]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回课程列表
        </Link>

        <div className="mt-3 flex flex-col gap-4">
          <div>
            <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">
              {isCreateMode ? 'CREATE COURSE' : 'EDIT COURSE'}
            </div>
            <h2
              className="mt-1 text-[1.35rem] font-semibold text-[#264268]"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {isCreateMode ? '新增课程' : '编辑课程'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f87aa]">
              课程编辑页也收成单列移动视图，保证进到详情页时仍然和手机外框演示逻辑一致。
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={saving || loading} className="rounded-full sm:w-fit">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            保存课程
          </Button>
        </div>
      </section>

      <div className="grid gap-4">
        <Card className="rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <CardHeader>
            <CardTitle>课程信息</CardTitle>
            <CardDescription>保留最关键的管理字段，先把课程维护链路打通。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载课程信息...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="course-title">课程标题</Label>
                  <Input
                    id="course-title"
                    value={formData.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="例如：蓝染入门课程"
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course-instructor">讲师</Label>
                    <Input
                      id="course-instructor"
                      value={formData.instructor}
                      onChange={(event) => updateField('instructor', event.target.value)}
                      placeholder="讲师姓名"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-category">课程分类</Label>
                    <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                      <SelectTrigger id="course-category" className="rounded-2xl">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course-duration">课程时长（分钟）</Label>
                    <Input
                      id="course-duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(event) => updateField('duration', event.target.value)}
                      placeholder="120"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-price">课程价格</Label>
                    <Input
                      id="course-price"
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
                  <Label htmlFor="course-description">课程简介</Label>
                  <Textarea
                    id="course-description"
                    value={formData.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="概括课程内容、适合人群和学习收获"
                    rows={5}
                    className="rounded-[20px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-image">封面地址</Label>
                  <Input
                    id="course-image"
                    value={formData.image_url}
                    onChange={(event) => updateField('image_url', event.target.value)}
                    placeholder="https://... 或 /images/..."
                    className="rounded-2xl"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <CardHeader>
            <CardTitle>预览</CardTitle>
            <CardDescription>让封面和课程关键信息在后台一眼能看清。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-[20px] border border-dashed border-slate-300 bg-slate-50">
              {previewImage ? (
                <img src={previewImage} alt={formData.title || '课程预览'} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-slate-400">
                  <BookOpen className="h-8 w-8" />
                  <span className="text-sm">暂无封面</span>
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-slate-50 px-4 py-3">
              <div className="text-sm font-medium text-slate-900">{formData.title || '未命名课程'}</div>
              <div className="mt-1 text-xs text-slate-500">
                {(formData.instructor || '未填写讲师')} · {(formData.category || '未分类')}
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">
                {formData.price ? `¥${Number(formData.price || 0).toFixed(2)}` : '¥0.00'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                课程时长：{formData.duration ? `${formData.duration} 分钟` : '未填写'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
