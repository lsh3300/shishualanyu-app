'use client'

import { useCallback, useEffect, useState } from 'react'
import { Filter, MoreHorizontal, Search, Shield, User, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-fetch'
import type { PaginationParams, UserFilters, UserListItem } from '@/types/admin.types'
import type { UserRole, UserStatus } from '@/types/database'

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    action: 'disable' | 'enable' | 'make_admin' | 'remove_admin'
    userName: string
  }>({ open: false, userId: '', action: 'disable', userName: '' })

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
      })

      const response = await adminFetch(`/api/admin/users?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取用户列表失败')
      }

      setUsers(result.data.users)
      setPagination(result.data.pagination)
    } catch (error) {
      toast({
        title: '加载失败',
        description: error instanceof Error ? error.message : '获取用户列表失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination.page, pagination.pageSize, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setFilters({ search: '', role: 'all', status: 'all' })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleUpdateUser = async (userId: string, data: { status?: UserStatus; role?: UserRole }) => {
    try {
      const response = await adminFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '操作失败')
      }

      toast({
        title: '操作成功',
        description: result.message || '用户信息已更新',
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmAction = () => {
    const { userId, action } = confirmDialog
    if (action === 'disable') handleUpdateUser(userId, { status: 'disabled' })
    if (action === 'enable') handleUpdateUser(userId, { status: 'active' })
    if (action === 'make_admin') handleUpdateUser(userId, { role: 'admin' })
    if (action === 'remove_admin') handleUpdateUser(userId, { role: 'user' })
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const getConfirmText = () => {
    const { action, userName } = confirmDialog
    switch (action) {
      case 'disable':
        return `确定要禁用用户“${userName}”吗？禁用后该用户将无法登录。`
      case 'enable':
        return `确定要启用用户“${userName}”吗？`
      case 'make_admin':
        return `确定要将用户“${userName}”设为管理员吗？`
      case 'remove_admin':
        return `确定要取消用户“${userName}”的管理员权限吗？`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">USERS</div>
        <h2
          className="mt-1 text-[1.35rem] font-semibold text-[#264268]"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        >
          用户管理
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6f87aa]">
          这页优先保留账号状态、角色切换和可演示的操作闭环，不再用宽屏后台布局压手机框。
        </p>
      </section>

      <section className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <div className="grid gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="搜索用户名或姓名"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              className="rounded-2xl border-[#dbe6f4] bg-white"
            />
            <Button variant="secondary" onClick={handleSearch} className="rounded-2xl">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={filters.role}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, role: value as UserFilters['role'] }))
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="rounded-2xl border-[#dbe6f4] bg-white">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value as UserFilters['status'] }))
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="rounded-2xl border-[#dbe6f4] bg-white">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
                <SelectItem value="pending">待激活</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filters.search || filters.role !== 'all' || filters.status !== 'all') ? (
            <Button variant="ghost" onClick={handleClearFilters} className="justify-start rounded-2xl text-[#5877a8]">
              <Filter className="mr-1 h-4 w-4" />
              清空筛选
            </Button>
          ) : null}
        </div>
      </section>

      <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <div className="divide-y divide-slate-100 md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4">
                <Skeleton className="h-16 w-full rounded-[20px]" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">暂无用户数据</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{(user.username || user.email)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{user.username || '未设置用户名'}</p>
                    <p className="truncate text-xs text-slate-500">{user.email || '-'}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: user.id,
                              action: 'disable',
                              userName: user.username || user.email,
                            })
                          }
                          className="text-rose-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          禁用用户
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: user.id,
                              action: 'enable',
                              userName: user.username || user.email,
                            })
                          }
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          启用用户
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {user.role === 'user' ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: user.id,
                              action: 'make_admin',
                              userName: user.username || user.email,
                            })
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          设为管理员
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: user.id,
                              action: 'remove_admin',
                              userName: user.username || user.email,
                            })
                          }
                        >
                          <User className="mr-2 h-4 w-4" />
                          取消管理员
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? '管理员' : '用户'}</Badge>
                  <Badge
                    variant={user.status === 'active' ? 'default' : user.status === 'disabled' ? 'destructive' : 'outline'}
                  >
                    {user.status === 'active' ? '正常' : user.status === 'disabled' ? '已禁用' : '待激活'}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500">
                  注册时间：{new Date(user.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-500">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{(user.username || user.email)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{user.username || '未设置用户名'}</p>
                          {user.full_name ? <p className="text-xs text-slate-500">{user.full_name}</p> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'active' ? 'default' : user.status === 'disabled' ? 'destructive' : 'outline'}
                      >
                        {user.status === 'active' ? '正常' : user.status === 'disabled' ? '已禁用' : '待激活'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{new Date(user.created_at).toLocaleDateString('zh-CN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  userId: user.id,
                                  action: 'disable',
                                  userName: user.username || user.email,
                                })
                              }
                              className="text-rose-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              禁用用户
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  userId: user.id,
                                  action: 'enable',
                                  userName: user.username || user.email,
                                })
                              }
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              启用用户
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {user.role === 'user' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  userId: user.id,
                                  action: 'make_admin',
                                  userName: user.username || user.email,
                                })
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              设为管理员
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  userId: user.id,
                                  action: 'remove_admin',
                                  userName: user.username || user.email,
                                })
                              }
                            >
                              <User className="mr-2 h-4 w-4" />
                              取消管理员
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 rounded-[24px] border border-white/80 bg-white/80 px-4 py-4 text-sm text-slate-500 shadow-[0_12px_28px_rgba(61,92,140,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-full"
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-full"
            >
              下一页
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>{getConfirmText()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
