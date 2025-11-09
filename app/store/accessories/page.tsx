import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
  { id: "indigo", label: "蓝染" },
  { id: "new", label: "新品" },
  { id: "discount", label: "优惠" },
]

const accessoriesProducts = [
  {
    id: "accessories-1",
    name: "蓝染帆布包",
    price: 88,
    image: "/indigo-dyed-canvas-bag.jpg",
    sales: 345,
    category: "accessories",
  },
  {
    id: "accessories-2",
    name: "扎染丝巾",
    price: 168,
    originalPrice: 228,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    sales: 234,
    discount: 26,
    category: "accessories",
  },
  {
    id: "accessories-3",
    name: "蜡染手机壳",
    price: 58,
    image: "/placeholder.svg",
    sales: 123,
    isNew: true,
    category: "accessories",
  },
  {
    id: "accessories-4",
    name: "蓝染笔记本套装",
    price: 78,
    image: "/placeholder.svg",
    sales: 89,
    category: "accessories",
  },
  {
    id: "accessories-5",
    name: "扎染钥匙扣",
    price: 28,
    image: "/placeholder.svg",
    sales: 267,
    category: "accessories",
  },
  {
    id: "accessories-6",
    name: "蜡染雨伞",
    price: 138,
    originalPrice: 168,
    image: "/placeholder.svg",
    sales: 45,
    discount: 18,
    category: "accessories",
  },
]

export default function AccessoriesPage() {
  return (
    <CategoryPageTemplate
      title="配饰精品"
      description="小巧精致的蓝染艺术配饰，为您的日常增添文化气息"
      bannerImage="/indigo-dyed-canvas-bag.jpg"
      bannerTitle="精致配饰 艺术生活"
      bannerDescription="每一件配饰都是传统工艺与现代生活的完美融合"
      filterOptions={filterOptions}
      products={accessoriesProducts}
      categoryType="accessories"
    />
  )
}