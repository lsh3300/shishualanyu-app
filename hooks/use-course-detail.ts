"use client"

import useSWR from "swr"
import { fetchJson, HttpError } from "@/lib/fetch-json"

interface CourseDetailData {
  course: Record<string, unknown> | null
  likes: { likesCount: number; isLiked: boolean }
  comments: Record<string, unknown>[]
  relatedCourses: Record<string, unknown>[]
}

export function useCourseDetail(identifier: string | undefined) {
  const swr = useSWR<CourseDetailData>(
    identifier ? ["course-detail", identifier] : null,
    async (): Promise<CourseDetailData> => {
      try {
        const data = await fetchJson<CourseDetailData>(
          `/api/courses/${identifier}/detail`,
          {
            timeoutMs: 15000,
            retries: 0,
          },
        )
        return data
      } catch (err) {
        if (err instanceof HttpError && err.status === 404) {
          return { course: null, likes: { likesCount: 0, isLiked: false }, comments: [], relatedCourses: [] }
        }
        throw err
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 0,
    },
  )

  return {
    courseDetail: swr.data,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
