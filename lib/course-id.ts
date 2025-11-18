const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LEGACY_UUID_PREFIX = "00000000-0000-0000-0000-"

const LEGACY_DIGITS_REGEX = /^[0-9]+$/

/**
 * 将课程ID规范化为UUID格式，兼容旧的数字ID
 */
export function normalizeCourseId(rawId?: string | null): string | null {
  if (!rawId) return null

  const trimmed = rawId.trim()
  if (!trimmed) return null

  if (UUID_REGEX.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  if (LEGACY_DIGITS_REGEX.test(trimmed)) {
    const digitsOnly = trimmed.replace(/\D/g, "")
    const normalizedDigits = digitsOnly.slice(-12).padStart(12, "0")
    return `${LEGACY_UUID_PREFIX}${normalizedDigits}`
  }

  return trimmed.toLowerCase()
}

/**
 * 将规范化后的UUID还原为旧的数字ID，便于前端路由使用
 */
export function denormalizeCourseId(id?: string | null): string {
  if (!id) return ""

  const lower = id.toLowerCase()
  if (lower.startsWith(LEGACY_UUID_PREFIX)) {
    const suffix = lower.substring(LEGACY_UUID_PREFIX.length)
    if (/^[0-9]{12}$/.test(suffix)) {
      return String(parseInt(suffix, 10))
    }
  }

  return id
}

export function isUuid(id: string): boolean {
  return UUID_REGEX.test(id)
}

