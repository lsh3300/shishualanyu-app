'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Search, Filter, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type DataTableColumn } from '@/components/admin/data-table'
import { EmptyState } from '@/components/admin/empty-state'
import { PageErrorBoundary } from '@/components/admin/error-boundary'
import { adminFetchJson } from '@/lib/admin-fetch'
import { exportToCSV, Formatters } from '@/lib/admin/export-utils'
import { getActionDescription, getTargetTypeDescription } from '@/lib/admin/log-utils'
import { toast } from 'sonner'
import type { AdminAction } from '@/types/admin.types'

interface LogItem {
  id: string
  admin_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin?: {
    id: string
    username: string | null
    full_name: string | null
  } | null
}

interface LogsResponse {
  logs: LogItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [action, setAction] = useState('all')
  const [targetType, setTargetType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize)
      })
      if (action !== 'all') params.set('action', action)
      if (targetType !== 'all') params.set('targetType', targetType)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await adminFetchJson<{ success: boolean; data: LogsResponse }>(
        `/api/admin/logs?${params}`
      )

      if (response.success) {
        setLogs(response.data.logs)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('获取日志列表失败:', error)
      toast.error('获取日志列表失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, action, targetType, startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExport = () => {
    exportToCSV(logs, {
      filename: `操作日志_${new Date().toLocaleDateString('zh-CN')}`,
      columns: [
        { key: 'created_at', header: '时间', formatter: Formatters.datetime },
        { key: 'action', header: '操作', formatter: (v) => getActionDescription(v as AdminAction) },
        { key: 'target_type', header: '目标类型', formatter: (v) => getTargetTypeDescription(String(v)) },
        { key: 'target_id', header: '目标ID' },
        { key: 'admin.username', header: '操作人' },
        { key: 'ip_address', header: 'IP地址' }
      ]
    })
    toast.success('导出成功')
  }

  const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (action.includes('delete') || action.includes('reject') || action.includes('disable')) {
      return 'destructive'
    }
    if (action.includes('create') || action.includes('approve') || action.includes('enable')) {
      return 'default'
    }
    return 'secondary'
  }

  const columns: DataTableColumn<LogItem>[] = [
    {
      key: 'created_at',
      title: '时间',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {new Date(String(value)).toLocaleString('zh-CN')}
        </span>
      )
    },
    {
      key: 'action',
      title: '操作',
      render: (value) => (
        <Badge variant={getActionBadgeVariant(String(value))}>
          {getActionDescription(value as AdminAction)}
        </Badge>
      )
    },
    {
      key: 'target_type',
      title: '目标类型',
      render: (value) => value ? getTargetTypeDescription(String(value)) : '-'
    },
    {
      key: 'details',
      title: '详情',
      render: (value, row) => {
        const details = value as Record<string, unknown> | null
        const targetName = details?.target_name as string | undefined
        return (
          <div className="max-w-xs truncate text-sm text-muted-foreground">
            {targetName || row.target_id || '-'}
          </div>
        )
      }
    },
    {
      key: 'admin',
      title: '操作人',
      render: (value) => {
        const admin = value as { username: string | null; full_name: string | null } | null
        return admin?.full_name || admin?.username || '系统'
      }
    },
    {
      key: 'ip_address',
      title: 'IP地址',
      render: (value) => (
        <span className="text-sm text-muted-foreground font-mono">
          {String(value || '-')}
        </span>
      )
    }
  ]

  return (
    <PageErrorBoundary pageName="操作日志">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">操作日志</h1>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部操作</SelectItem>
              <SelectItem value="user_disable">禁用用户</SelectItem>
              <SelectItem value="user_enable">启用用户</SelectItem>
              <SelectItem value="user_role_change">修改角色</SelectItem>
              <SelectItem value="content_approve">通过审核</SelectItem>
              <SelectItem value="content_reject">拒绝审核</SelectItem>
              <SelectItem value="product_create">创建产品</SelectItem>
              <SelectItem value="product_update">更新产品</SelectItem>
              <SelectItem value="product_delete">删除产品</SelectItem>
              <SelectItem value="course_create">创建课程</SelectItem>
              <SelectItem value="course_update">更新课程</SelectItem>
              <SelectItem value="course_delete">删除课程</SelectItem>
            </SelectContent>
          </Select>

          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="目标类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="user">用户</SelectItem>
              <SelectItem value="product">产品</SelectItem>
              <SelectItem value="course">课程</SelectItem>
              <SelectItem value="content">内容</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
              placeholder="开始日期"
            />
            <span className="text-muted-foreground">至</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
              placeholder="结束日期"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAction('all')
              setTargetType('all')
              setStartDate('')
              setEndDate('')
            }}
          >
            重置筛选
          </Button>
        </div>

        {!loading && logs.length === 0 ? (
          <EmptyState
            type="content"
            title="暂无日志"
            description="还没有任何操作日志记录"
          />
        ) : (
          <DataTable
            data={logs}
            columns={columns}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            loading={loading}
            sortable
          />
        )}
      </div>
    </PageErrorBoundary>
  )
}
