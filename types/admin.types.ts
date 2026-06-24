// 管理员后台系统类型定义

import { UserRole, UserStatus, ContentType, ReviewStatus } from './database'

// ============================================
// 仪表盘相关类型
// ============================================

// 统计卡片数据
export interface StatCardData {
  title: string
  value: number | string
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

// 趋势数据点
export interface TrendDataPoint {
  date: string
  count: number
}

// 仪表盘统计数据
export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalCourses: number
  totalProducts: number
  totalOrders: number
  ordersToday: number
  pendingReviews: number
  userTrend: TrendDataPoint[]
  orderTrend: TrendDataPoint[]
}

// ============================================
// 用户管理相关类型
// ============================================

// 用户列表项
export interface UserListItem {
  id: string
  username: string | null
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

// 用户筛选参数
export interface UserFilters {
  search: string
  role: 'all' | UserRole
  status: 'all' | UserStatus
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 用户列表响应
export interface UsersListResponse {
  users: UserListItem[]
  pagination: PaginationParams
}

// 更新用户请求
export interface UpdateUserRequest {
  status?: UserStatus
  role?: UserRole
}

// ============================================
// 内容审核相关类型
// ============================================

// 提交者信息
export interface SubmitterInfo {
  id: string
  username: string | null
  avatar_url: string | null
}

// 待审核内容项
export interface ReviewItem {
  id: string
  content_type: ContentType
  content_id: string
  content_preview: string | null
  submitter: SubmitterInfo | null
  status: ReviewStatus
  reject_reason: string | null
  created_at: string
  reviewed_at: string | null
}

// 内容筛选参数
export interface ContentFilters {
  type: 'all' | ContentType
  status: 'all' | ReviewStatus
}

// 审核操作请求
export interface ReviewActionRequest {
  action: 'approve' | 'reject'
  reason?: string
}

// 内容列表响应
export interface ContentListResponse {
  items: ReviewItem[]
  pagination: PaginationParams
}

// ============================================
// 导航相关类型
// ============================================

// 导航项
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
}

// ============================================
// API 响应类型
// ============================================

// 通用 API 响应
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 统计数据 API 响应
export type StatsApiResponse = ApiResponse<DashboardStats>

// 用户列表 API 响应
export type UsersApiResponse = ApiResponse<UsersListResponse>

// 内容列表 API 响应
export type ContentApiResponse = ApiResponse<ContentListResponse>

// ============================================
// 管理员日志相关类型
// ============================================

// 管理员操作类型
export type AdminAction = 
  | 'user_disable'
  | 'user_enable'
  | 'user_role_change'
  | 'content_approve'
  | 'content_reject'
  | 'product_create'
  | 'product_update'
  | 'product_delete'
  | 'course_create'
  | 'course_update'
  | 'course_delete'

// 管理员日志项
export interface AdminLogItem {
  id: string
  admin_id: string | null
  action: AdminAction
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
