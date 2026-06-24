/**
 * 导出列定义
 */
export interface ExportColumn {
  key: string
  header: string
  formatter?: (value: unknown) => string
}

/**
 * 导出选项
 */
export interface ExportOptions {
  filename: string
  columns: ExportColumn[]
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

/**
 * 转义 CSV 字段值
 * 处理包含逗号、引号、换行符的值
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * 格式化值为字符串
 */
function formatValue(value: unknown, formatter?: (value: unknown) => string): string {
  if (formatter) {
    return formatter(value)
  }
  
  if (value === null || value === undefined) {
    return ''
  }
  
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  
  if (value instanceof Date) {
    return value.toLocaleString('zh-CN')
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return String(value)
}

/**
 * 导出数据为 CSV 格式
 * 
 * @param data 要导出的数据数组
 * @param options 导出选项
 */
export function exportToCSV<T extends object>(
  data: T[],
  options: ExportOptions
): void {
  const { filename, columns } = options

  // 生成表头
  const headers = columns.map(col => escapeCSVValue(col.header))
  
  // 生成数据行
  const rows = data.map(item => {
    return columns.map(col => {
      const value = getNestedValue(item as Record<string, unknown>, col.key)
      const formatted = formatValue(value, col.formatter)
      return escapeCSVValue(formatted)
    })
  })

  // 组合 CSV 内容（添加 BOM 以支持中文）
  const BOM = '\uFEFF'
  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n')

  // 下载文件
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8')
}

/**
 * 导出数据为 JSON 格式
 * 
 * @param data 要导出的数据
 * @param filename 文件名（不含扩展名）
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

/**
 * 下载文件
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * 常用格式化器
 */
export const Formatters = {
  /**
   * 日期格式化
   */
  date: (value: unknown): string => {
    if (!value) return ''
    const date = new Date(String(value))
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN')
  },

  /**
   * 日期时间格式化
   */
  datetime: (value: unknown): string => {
    if (!value) return ''
    const date = new Date(String(value))
    return isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN')
  },

  /**
   * 货币格式化
   */
  currency: (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const num = Number(value)
    return isNaN(num) ? String(value) : `¥${num.toFixed(2)}`
  },

  /**
   * 百分比格式化
   */
  percent: (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const num = Number(value)
    return isNaN(num) ? String(value) : `${(num * 100).toFixed(1)}%`
  },

  /**
   * 布尔值格式化
   */
  boolean: (trueText = '是', falseText = '否') => (value: unknown): string => {
    return value ? trueText : falseText
  },

  /**
   * 枚举值格式化
   */
  enum: (mapping: Record<string, string>) => (value: unknown): string => {
    return mapping[String(value)] || String(value)
  }
}

/**
 * 用户状态格式化
 */
export const userStatusFormatter = Formatters.enum({
  'active': '正常',
  'disabled': '已禁用'
})

/**
 * 用户角色格式化
 */
export const userRoleFormatter = Formatters.enum({
  'user': '普通用户',
  'admin': '管理员'
})

/**
 * 审核状态格式化
 */
export const reviewStatusFormatter = Formatters.enum({
  'pending': '待审核',
  'approved': '已通过',
  'rejected': '已拒绝'
})
