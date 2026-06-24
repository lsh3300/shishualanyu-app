import { NextResponse } from 'next/server'

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 成功响应格式
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

/**
 * 错误响应格式
 */
export interface ApiErrorResponse {
  success: false
  error: string
  errorCode?: string
  details?: Record<string, unknown>
}

/**
 * 分页数据格式
 */
export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationInfo
}

/**
 * API 响应类型
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * 创建成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data
  }
  if (message) {
    response.message = message
  }
  return NextResponse.json(response, { status })
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  status: number = 500,
  errorCode?: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error
  }
  if (errorCode) {
    response.errorCode = errorCode
  }
  if (details) {
    response.details = details
  }
  return NextResponse.json(response, { status })
}

/**
 * 创建分页响应
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: PaginationInfo,
  message?: string
): NextResponse<ApiSuccessResponse<PaginatedData<T>>> {
  return successResponse({ items, pagination }, message)
}

/**
 * 计算分页信息
 */
export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
): PaginationInfo {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 解析分页参数
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { page?: number; pageSize?: number; maxPageSize?: number } = {}
): { page: number; pageSize: number; from: number; to: number } {
  const { page: defaultPage = 1, pageSize: defaultPageSize = 20, maxPageSize = 100 } = defaults
  
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaultPage)))
  const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(searchParams.get('pageSize') || String(defaultPageSize))))
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  return { page, pageSize, from, to }
}

/**
 * 常用错误响应快捷方法
 */
export const ErrorResponses = {
  unauthorized: (message = '未授权访问') => errorResponse(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = '无权限执行此操作') => errorResponse(message, 403, 'FORBIDDEN'),
  notFound: (message = '资源不存在') => errorResponse(message, 404, 'NOT_FOUND'),
  badRequest: (message = '请求参数无效', details?: Record<string, unknown>) => 
    errorResponse(message, 400, 'INVALID_PARAMS', details),
  serverError: (message = '服务器错误，请稍后重试') => errorResponse(message, 500, 'INTERNAL_ERROR'),
  databaseError: (message = '数据操作失败') => errorResponse(message, 500, 'DATABASE_ERROR')
}
