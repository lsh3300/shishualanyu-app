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
    id: "44444444-4444-4444-4444-444444444444",
    name: "蜡染抱枕",
    price: 68,
    originalPrice: 98,
    image: "/traditional-wax-resist-cushion.jpg",
    sales: 178,
    isNew: true,
    discount: 24,
    category: "家居",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "蜡染丝巾",
    price: 198,
    originalPrice: 228,
    image: "/wax-resist-dyeing-technique.jpg",
    sales: 92,
    isNew: true,
    discount: 23,
    category: "配饰",
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