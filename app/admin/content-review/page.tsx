'use client'

import { useEffect, useState, useCallback } from 'react'
import { Check, X, MessageSquare, Palette, Flag, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-fetch'
import type { ReviewItem, ContentFilters, PaginationParams } from '@/types/admin.types'
import type { ContentType } from '@/types/database'

const contentTypeLabels: Record<ContentType, string> = {
  comment: '评论',
  work: '作品',
  report: '举报'
}

const contentTypeIcons: Record<ContentType, typeof MessageSquare> = {
  comment: MessageSquare,
  work: Palette,
  report: Flag
}

export default function ContentReviewPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<ContentFilters>({
    type: 'all',
    status: 'pending'
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // 拒绝对话框状态
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    itemId: string
    reason: string
  }>({ open: false, itemId: '', reason: '' })

  // 获取审核内容列表
  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status })
      })

      const response = await adminFetch(`/api/admin/content?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取审核内容失败')
      }

      setItems(result.data.items)
      setPagination(result.data.pagination)
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '获取审核内容失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, filters, toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // 审核操作
  const handleReview = async (itemId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await adminFetch(`/api/admin/content/${itemId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '操作失败')
      }

      toast({
        title: '成功',
        description: result.message
      })
      fetchContent()
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'destructive'
      })
    }
  }

  // 确认拒绝
  const handleConfirmReject = () => {
    if (!rejectDialog.reason.trim()) {
      toast({
        title: '错误',
        description: '请输入拒绝原因',
        variant: 'destructive'
      })
      return
    }
    handleReview(rejectDialog.itemId, 'reject', rejectDialog.reason)
    setRejectDialog({ open: false, itemId: '', reason: '' })
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">待审核</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">已通过</Badge>
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">内容审核</h1>
        <p className="text-muted-foreground">审核用户提交的评论、作品和举报</p>
      </div>

      {/* 类型筛选标签 */}
      <Tabs
        value={filters.type}
        onValueChange={(value) => {
          setFilters(prev => ({ ...prev, type: value as ContentFilters['type'] }))
          setPagination(prev => ({ ...prev, page: 1 }))
        }}
      >
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="comment">
            <MessageSquare className="h-4 w-4 mr-1" />
            评论
          </TabsTrigger>
          <TabsTrigger value="work">
            <Palette className="h-4 w-4 mr-1" />
            作品
          </TabsTrigger>
          <TabsTrigger value="report">
            <Flag className="h-4 w-4 mr-1" />
            举报
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 状态筛选 */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filters.status === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilters(prev => ({ ...prev, status }))
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
          >
            {status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}
          </Button>
        ))}
        <Button
          variant={filters.status === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setFilters(prev => ({ ...prev, status: 'all' }))
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
        >
          全部状态
        </Button>
      </div>

      {/* 内容列表 */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无待审核内容
            </CardContent>
          </Card>
        ) : (
          items.map((item) => {
            const Icon = contentTypeIcons[item.content_type]
            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.submitter?.avatar_url || undefined} />
                        <AvatarFallback>
                          {item.submitter?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {item.submitter?.username || '匿名用户'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {contentTypeLabels[item.content_type]}
                      </Badge>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {item.content_preview || '（无预览内容）'}
                    </p>
                  </div>
                  {item.reject_reason && (
                    <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-destructive">
                        拒绝原因: {item.reject_reason}
                      </p>
                    </div>
                  )}
                </CardContent>
                {item.status === 'pending' && (
                  <CardFooter className="gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReview(item.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      通过
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectDialog({
                        open: true,
                        itemId: item.id,
                        reason: ''
                      })}
                    >
                      <X className="h-4 w-4 mr-1" />
                      拒绝
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 拒绝原因对话框 */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝内容</DialogTitle>
            <DialogDescription>请输入拒绝原因，将通知提交者</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入拒绝原因..."
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ ...rejectDialog, open: false })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
