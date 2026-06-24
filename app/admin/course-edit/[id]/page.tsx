import CourseEditPage from "@/app/admin/course-edit/page"

export default function CourseEditPageWithId({ params }: { params: { id: string } }) {
  return <CourseEditPage params={params} />
}