"use client"

import { useCallback } from "react"
import useSWR from "swr"

import { useAuth } from "@/contexts/auth-context"
import { fetchJson, HttpError } from "@/lib/fetch-json"

export interface EnrollmentCourse {
  id?: string
  title?: string
  description?: string | null
  instructor?: string | null
  image_url?: string | null
  thumbnail_url?: string | null
  duration?: number | null
}

export interface EnrollmentRecord {
  id: string
  course_id?: string
  progress?: number | null
  status?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_accessed_at?: string | null
  courses?: EnrollmentCourse | null
}

interface UserCoursesResponse {
  courses: {
    total: number
    completed: number
    inProgress: number
    list: EnrollmentRecord[]
  }
  learningDays: number
}

export function useUserCourses() {
  const { user, getToken } = useAuth()

  const swr = useSWR<UserCoursesResponse>(
    user ? ["user-courses", user.id] : null,
    async () => {
      const token = await getToken()
      if (!token) {
        throw new HttpError("Unauthorized", 401)
      }

      return fetchJson<UserCoursesResponse>("/api/user/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 15000,
        retries: 1,
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    },
  )

  const refresh = useCallback(async () => {
    await swr.mutate()
  }, [swr])

  return {
    coursesData: swr.data?.courses,
    learningDays: swr.data?.learningDays ?? 0,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    refresh,
  }
}
