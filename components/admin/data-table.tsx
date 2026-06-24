'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

export interface DataTableColumn<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: DataTableColumn<T>[]
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  sortable?: boolean
  sortState?: SortState
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  loading?: boolean
  emptyMessage?: string
  rowKey?: keyof T
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pagination,
  onPageChange,
  sortable = false,
  sortState,
  onSort,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  loading = false,
  emptyMessage = '暂无数据',
  rowKey = 'id' as keyof T,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [localSort, setLocalSort] = useState<SortState | null>(null)
  const currentSort = sortState || localSort

  const handleSort = (key: string) => {
    if (!sortable) return

    const nextDirection = currentSort?.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc'

    if (onSort) {
      onSort(key, nextDirection)
    } else {
      setLocalSort({ key, direction: nextDirection })
    }
  }

  const sortedData = useMemo(() => {
    if (!localSort || onSort) return data

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, localSort.key)
      const bValue = getNestedValue(b, localSort.key)

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : 1
      return localSort.direction === 'asc' ? comparison : -comparison
    })
  }, [data, localSort, onSort])

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? sortedData.map((row) => String(row[rowKey])) : [])
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id))
  }

  const isAllSelected = sortedData.length > 0 && selectedIds.length === sortedData.length
  const isPartialSelected = selectedIds.length > 0 && selectedIds.length < sortedData.length

  const renderSortIcon = (key: string) => {
    if (!sortable) return null
    if (currentSort?.key === key) {
      return currentSort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return <ChevronsUpDown className="h-4 w-4 opacity-40" />
  }

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-[24px] border border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)] ${className}`}>
        <div className="space-y-3 p-4 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80">
                {selectable && (
                  <th className="w-12 p-4">
                    <Skeleton className="h-4 w-4" />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th key={index} className="p-4 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
                  {selectable && (
                    <td className="p-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map((_, columnIndex) => (
                    <td key={columnIndex} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-[24px] border border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)] ${className}`}>
      <div className="md:hidden">
        {selectable ? (
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
              <span>本页全选</span>
            </label>
            {isPartialSelected ? <span className="text-xs text-slate-500">已选择部分项目</span> : null}
          </div>
        ) : null}

        {sortedData.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{emptyMessage}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedData.map((row, rowIndex) => {
              const rowId = String(row[rowKey])
              const isSelected = selectedIds.includes(rowId)

              return (
                <div
                  key={rowId}
                  className={`p-4 transition-colors ${isSelected ? 'bg-blue-50/55' : 'bg-white/30'} ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  <div className="flex items-start gap-3">
                    {selectable ? (
                      <div className="pt-1" onClick={(event) => event.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectRow(rowId, checked === true)} />
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1 space-y-3">
                      {columns.map((column, columnIndex) => {
                        const value = getNestedValue(row, String(column.key))
                        const content = column.render ? column.render(value, row, rowIndex) : String(value ?? '-')
                        const isPrimary = columnIndex === 0
                        const isActionColumn = String(column.key) === 'actions'

                        if (isPrimary) {
                          return (
                            <div key={columnIndex} className="min-w-0">
                              {content}
                            </div>
                          )
                        }

                        if (isActionColumn) {
                          return (
                            <div key={columnIndex} className="border-t border-slate-100 pt-3" onClick={(event) => event.stopPropagation()}>
                              {content}
                            </div>
                          )
                        }

                        return (
                          <div key={columnIndex} className="flex items-start justify-between gap-3">
                            <div className="shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              {column.title}
                            </div>
                            <div
                              className={`min-w-0 flex-1 text-right text-sm text-slate-700 ${
                                column.align === 'center' ? 'text-center' : column.align === 'left' ? 'text-left' : 'text-right'
                              }`}
                            >
                              {content}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80">
              {selectable ? (
                <th className="w-12 p-4">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(element) => {
                      if (element) {
                        ;(element as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isPartialSelected
                      }
                    }}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  />
                </th>
              ) : null}

              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`p-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 ${
                    sortable && column.sortable !== false ? 'cursor-pointer select-none hover:text-slate-900' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                >
                  <div
                    className={`flex items-center gap-1 ${
                      column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''
                    }`}
                  >
                    {column.title}
                    {column.sortable !== false && renderSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-10 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => {
                const rowId = String(row[rowKey])
                const isSelected = selectedIds.includes(rowId)

                return (
                  <tr
                    key={rowId}
                    className={`border-b border-slate-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable ? (
                      <td className="p-4" onClick={(event) => event.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectRow(rowId, checked === true)} />
                      </td>
                    ) : null}

                    {columns.map((column, columnIndex) => {
                      const value = getNestedValue(row, String(column.key))
                      return (
                        <td
                          key={columnIndex}
                          className={`p-4 text-sm text-slate-700 ${
                            column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                          }`}
                        >
                          {column.render ? column.render(value, row, rowIndex) : String(value ?? '-')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-slate-200/80 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="rounded-xl border-[#dbe6f4]"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="rounded-xl border-[#dbe6f4]"
            >
              下一页
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

export default DataTable
