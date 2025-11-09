import { CoursePageTemplate } from "@/components/templates/course-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "入门", label: "入门" },
  { id: "进阶", label: "进阶" },
  { id: "latest", label: "最新" },
  { id: "popular", label: "人气" },
  { id: "free", label: "免费" },
]

const tieDyeCourses = [
  {
    id: "1",
    title: "传统扎染基础入门课程",
    instructor: "李师傅",
    duration: "2小时30分",
    students: 1234,
    rating: 4.8,
    thumbnail: "/tie-dye-tutorial-hands-on.jpg",
    isFree: true,
    difficulty: "入门" as const,
    category: "扎染",
  },
  {
    id: "2",
    title: "扎染纹样设计与创作",
    instructor: "张设计师",
    duration: "3小时",
    students: 987,
    rating: 4.7,
    thumbnail: "/handmade-tie-dye-silk-scarf.jpg",
    price: 168,
    difficulty: "进阶" as const,
    category: "扎染",
  },
  {
    id: "3",
    title: "植物扎染与自然染色",
    instructor: "王老师",
    duration: "4小时15分",
    students: 765,
    rating: 4.9,
    thumbnail: "/ancient-indigo-dyeing-history-silk-road.jpg",
    price: 238,
    difficulty: "进阶" as const,
    category: "扎染",
  },
  {
    id: "4",
    title: "扎染家居饰品制作",
    instructor: "李师傅",
    duration: "2小时",
    students: 1123,
    rating: 4.6,
    thumbnail: "/indigo-dyed-canvas-bag.jpg",
    isFree: true,
    difficulty: "入门" as const,
    category: "扎染",
  },
]

export default function TieDyeCoursePage() {
  return (
    <CoursePageTemplate
      title="扎染课程"
      description="从传统到现代，掌握这项古老而美丽的染色技艺"
      bannerImage="/tie-dye-tutorial-hands-on.jpg"
      bannerTitle="探索扎染世界"
      bannerDescription="开启一段色彩之旅，创造独特的艺术作品"
      filterOptions={filterOptions}
      courses={tieDyeCourses}
      courseType="tie-dye"
    />
  )
}