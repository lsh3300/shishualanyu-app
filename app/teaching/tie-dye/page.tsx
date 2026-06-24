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
    id: "c0000001-0001-0001-0001-000000000001",
    slug: "tie-dye-basics",
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
    id: "c0000002-0002-0002-0002-000000000002",
    slug: "tie-dye-advanced",
    title: "扎染进阶技法与创作",
    instructor: "王老师",
    duration: "3小时15分",
    students: 987,
    rating: 4.9,
    thumbnail: "/traditional-indigo-dyeing-workshop.jpg",
    price: 168.0,
    difficulty: "进阶" as const,
    category: "扎染",
  },
  {
    id: "c0000003-0003-0003-0003-000000000003",
    slug: "modern-tie-dye-art",
    title: "现代扎染艺术创作",
    instructor: "张设计师",
    duration: "2小时45分",
    students: 756,
    rating: 4.7,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    price: 198.0,
    difficulty: "进阶" as const,
    category: "扎染",
  },
  {
    id: "c0000004-0004-0004-0004-000000000004",
    slug: "tie-dye-business",
    title: "扎染工艺与商业应用",
    instructor: "陈企业家",
    duration: "1小时45分",
    students: 543,
    rating: 4.6,
    thumbnail: "/modern-indigo-dyed-fashion-products.jpg",
    price: 128.0,
    difficulty: "高级" as const,
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