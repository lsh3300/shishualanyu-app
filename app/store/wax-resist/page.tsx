import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "蜡染", label: "蜡染" },
  { id: "抱枕", label: "抱枕" },
  { id: "装饰画", label: "装饰画" },
  { id: "桌布", label: "桌布" },
  { id: "新品", label: "新品" },
]

const waxResistProducts = [
  {
    id: "7",
    name: "传统蜡染抱枕",
    price: 158,
    originalPrice: 208,
    image: "/traditional-wax-resist-cushion.jpg",
    sales: 178,
    isNew: true,
    discount: 24,
    category: "家居",
  },
  {
    id: "8",
    name: "蜡染装饰画",
    price: 288,
    originalPrice: 368,
    image: "/modern-indigo-dyeing-art.jpg",
    sales: 92,
    isNew: false,
    discount: 22,
    category: "家居",
  },
  {
    id: "9",
    name: "蜡染桌布",
    price: 198,
    originalPrice: 258,
    image: "/placeholder.svg",
    sales: 67,
    isNew: true,
    discount: 23,
    category: "家居",
  },
  {
    id: "10",
    name: "蜡染围巾",
    price: 178,
    originalPrice: 238,
    image: "/placeholder.svg",
    sales: 124,
    isNew: false,
    discount: 25,
    category: "服饰",
  },
  {
    id: "11",
    name: "蜡染手提包",
    price: 218,
    originalPrice: 288,
    image: "/placeholder.svg",
    sales: 89,
    isNew: true,
    discount: 24,
    category: "配饰",
  },
  {
    id: "12",
    name: "蜡染茶席",
    price: 168,
    originalPrice: 218,
    image: "/placeholder.svg",
    sales: 103,
    isNew: false,
    discount: 23,
    category: "家居",
  },
]

export default function WaxResistPage() {
  return (
    <CategoryPageTemplate
      title="蜡染专区"
      description="精选蜡染工艺作品，传承千年非物质文化遗产技艺"
      bannerImage="/wax-resist-dyeing-technique.jpg"
      bannerTitle="蜡染艺术"
      bannerDescription="古老技艺与现代生活的完美融合"
      filterOptions={filterOptions}
      products={waxResistProducts}
      categoryType="home"
    />
  )
}