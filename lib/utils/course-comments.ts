import { normalizeCourseId } from '@/lib/course-id'

type CourseLike = Record<string, unknown> & {
  id?: string | null
  slug?: string | null
}

export function getCourseIdCandidates(identifier: string, course: CourseLike | null | undefined) {
  const candidates = new Set<string>()

  const push = (value: unknown) => {
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (!trimmed) return
    candidates.add(trimmed)

    const normalized = normalizeCourseId(trimmed)
    if (normalized) {
      candidates.add(normalized)
    }
  }

  push(identifier)
  push(course?.id)
  push(course?.slug)

  return Array.from(candidates)
}
