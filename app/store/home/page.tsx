import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
  { id: "indigo", label: "蓝染" },
  { id: "new", label: "新品" },
  { id: "discount", label: "优惠" },
]

const homeProducts = [
  {
    id: "home-1",
    name: "蓝染棉麻茶席",
    price: 298,
    image: "/indigo-dyed-linen-tea-mat.jpg",
    sales: 156,
    category: "home",
  },
  {
    id: "home-2",
    name: "传统蜡染抱枕",
    price: 128,
    originalPrice: 168,
    image: "/traditional-wax-resist-cushion.jpg",
    sales: 89,
    discount: 24,
    category: "home",
  },
  {
    id: "home-3",
    name: "扎染桌布套装",
    price: 268,
    image: "/placeholder.svg",
    sales: 67,
    category: "home",
  },
  {
    id: "home-4",
    name: "蓝染窗帘",
    price: 388,
    originalPrice: 458,
    image: "/placeholder.svg",
    sales: 45,
    discount: 15,
    category: "home",
  },
  {
    id: "home-5",
    name: "蜡染装饰画",
    price: 198,
    image: "/placeholder.svg",
    sales: 34,
    isNew: true,
    category: "home",
  },
  {
    id: "home-6",
    name: "扎染地毯",
    price: 588,
    image: "/placeholder.svg",
    sales: 23,
    category: "home",
  },
]

export default function HomePage() {
  return (
    <CategoryPageTemplate
      title="家居臻品"
      description="为您的家居空间增添传统蓝染艺术的文化气息"
      bannerImage="/indigo-dyed-linen-tea-mat.jpg"
      bannerTitle="雅致生活 艺术家居"
      bannerDescription="每一件家居用品都承载着千年蓝染工艺的文化底蕴"
      filterOptions={filterOptions}
      products={homeProducts}
      categoryType="home"
    />
  )
}