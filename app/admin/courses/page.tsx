'use client'

import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Download, Edit, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BatchActions, type BatchAction } from '@/components/admin/batch-actions'
import { DataTable, type DataTableColumn } from '@/components/admin/data-table'
import { EmptyState } from '@/components/admin/empty-state'
import { PageErrorBoundary } from '@/components/admin/error-boundary'
import { adminFetchJson } from '@/lib/admin-fetch'
import { exportToCSV, Formatters } from '@/lib/admin/export-utils'

interface Course {
  id: string
  title: string
  description: string | null
  instructor: string
  duration: number
  price: number
  image_url: string | null
  category: string
  created_at: string
  updated_at: string
}

interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const COURSE_CATEGORIES = ['all', '蜡染', '扎染', '刺绣', '编织', '陶艺', '木工', '剪纸', '其他']

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      })

      if (search.trim()) params.set('search', search.trim())
      if (category !== 'all') params.set('category', category)

      const response = await adminFetchJson<{ success: boolean; data: CoursesResponse }>(
        `/api/admin/courses?${params}`
      )

      if (response.success) {
        setCourses(response.data.courses)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('获取课程列表失败:', error)
      toast.error('获取课程列表失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, search, category])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个课程吗？')) return

    try {
      const response = await adminFetchJson<{ success: boolean }>(`/api/admin/courses/${id}`, { method: 'DELETE' })
      if (response.success) {
        toast.success('课程已删除')
        fetchCourses()
      }
    } catch (error) {
      console.error('删除课程失败:', error)
      toast.error('删除课程失败')
    }
  }

  const handleBatchAction = async (actionKey: string) => {
    if (actionKey !== 'delete') return

    try {
      await Promise.all(selectedIds.map((id) => adminFetchJson(`/api/admin/courses/${id}`, { method: 'DELETE' })))
      toast.success(`已删除 ${selectedIds.length} 个课程`)
      setSelectedIds([])
      fetchCourses()
    } catch (error) {
      console.error('批量删除课程失败:', error)
      toast.error('批量删除课程失败')
    }
  }

  const handleExport = () => {
    exportToCSV(courses, {
      filename: `课程列表_${new Date().toLocaleDateString('zh-CN')}`,
      columns: [
        { key: 'title', header: '课程标题' },
        { key: 'instructor', header: '讲师' },
        { key: 'category', header: '分类' },
        { key: 'price', header: '价格', formatter: Formatters.currency },
        { key: 'duration', header: '时长（分钟）' },
        { key: 'created_at', header: '创建时间', formatter: Formatters.datetime },
      ],
    })
    toast.success('已导出当前课程列表')
  }

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'title',
      title: '课程',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] bg-slate-100">
            {row.image_url ? <img src={row.image_url} alt={row.title} className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900">{row.title}</div>
            <div className="text-xs text-slate-500">{row.instructor}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: '分类',
      render: (value) => <Badge variant="outline">{String(value)}</Badge>,
    },
    {
      key: 'price',
      title: '价格',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">¥{Number(value || 0).toFixed(2)}</span>,
    },
    {
      key: 'duration',
      title: '时长',
      render: (value) => `${value} 分钟`,
    },
    {
      key: 'created_at',
      title: '创建时间',
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/course-edit/${row.id}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="rounded-full text-rose-600" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const batchActions: BatchAction[] = [
    {
      key: 'delete',
      label: '批量删除',
      variant: 'destructive',
      confirmTitle: '确认删除',
      confirmMessage: '确定要删除选中的 {count} 个课程吗？此操作不可撤销。',
    },
  ]

  return (
    <PageErrorBoundary pageName="课程管理">
      <div className="space-y-5">
        <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">COURSES</div>
              <h2
                className="mt-1 text-[1.35rem] font-semibold text-[#264268]"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                课程管理
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6f87aa]">
                课程维护页也收回到单列移动后台风格，便于在手机外框里自然展示。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={handleExport} className="rounded-full border-[#d9e6f6] bg-white/90">
                <Download className="mr-2 h-4 w-4" />
                导出列表
              </Button>
              <Link href="/admin/course-edit/new">
                <Button className="w-full rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  新增课程
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
          <div className="grid gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索课程标题或描述"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-2xl border-[#dbe6f4] bg-white pl-9"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-2xl border-[#dbe6f4] bg-white">
                <SelectValue placeholder="课程分类" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === 'all' ? '全部分类' : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <BatchActions
          selectedCount={selectedIds.length}
          actions={batchActions}
          onAction={handleBatchAction}
          onClearSelection={() => setSelectedIds([])}
        />

        {!loading && courses.length === 0 ? (
          <EmptyState
            type="courses"
            action={{
              label: '新增课程',
              onClick: () => {
                window.location.href = '/admin/course-edit/new'
              },
            }}
          />
        ) : (
          <DataTable
            data={courses}
            columns={columns}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            loading={loading}
            sortable
          />
        )}
      </div>
    </PageErrorBoundary>
  )
}
