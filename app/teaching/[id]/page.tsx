'use client'

import { CourseDetailTemplate } from "@/components/templates/course-detail-template"
import { getCourseById } from "@/data/models"
import { notFound } from "next/navigation"

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = getCourseById(params.id)
  
  if (!course) {
    notFound()
  }

  return <CourseDetailTemplate course={course} courseType="course" />
}
