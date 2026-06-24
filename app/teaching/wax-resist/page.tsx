import { CoursePageTemplate } from "@/components/templates/course-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "beginner", label: "入门" },
  { id: "advanced", label: "进阶" },
  { id: "latest", label: "最新" },
  { id: "popular", label: "人气" },
  { id: "free", label: "免费" },
]

const waxResistCourses = [
  {
    id: "c0000005-0005-0005-0005-000000000005",
    slug: "wax-dyeing-basics",
    title: "蜡染工艺基础入门",
    instructor: "王老师",
    duration: "3小时15分",
    students: 856,
    rating: 4.9,
    thumbnail: "/wax-resist-dyeing-technique.jpg",
    price: 199.0,
    difficulty: "入门" as const,
    category: "蜡染",
  },
  {
    id: "c0000006-0006-0006-0006-000000000006",
    slug: "traditional-miao-wax-dyeing",
    title: "传统苗族蜡染技法",
    instructor: "陈老师",
    duration: "4小时",
    students: 723,
    rating: 4.8,
    thumbnail: "/traditional-wax-resist-cushion.jpg",
    price: 258.0,
    difficulty: "进阶" as const,
    category: "蜡染",
  },
  {
    id: "c0000007-0007-0007-0007-000000000007",
    slug: "wax-dyeing-pattern-design",
    title: "蜡染纹样设计与应用",
    instructor: "张设计师",
    duration: "2小时45分",
    students: 654,
    rating: 4.7,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    price: 178.0,
    difficulty: "进阶" as const,
    category: "蜡染",
  },
  {
    id: "c0000008-0008-0008-0008-000000000008",
    slug: "wax-and-tie-dye-combination",
    title: "蜡染与扎染结合创作",
    instructor: "李师傅",
    duration: "3小时30分",
    students: 921,
    rating: 4.9,
    thumbnail: "/modern-indigo-dyed-fashion-products.jpg",
    price: 238.0,
    difficulty: "高级" as const,
    category: "蜡染",
  },
]

export default function WaxResistCoursePage() {
  return (
    <CoursePageTemplate
      title="蜡染课程"
      description="学习这项流传千年的非物质文化遗产技艺"
      bannerImage="/wax-resist-dyeing-technique.jpg"
      bannerTitle="蜡染艺术之旅"
      bannerDescription="用蜡刀描绘，用靛蓝染色，创造永恒的艺术品"
      filterOptions={filterOptions}
      courses={waxResistCourses}
      courseType="wax-resist"
    />
  )
}