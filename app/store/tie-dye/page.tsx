import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
  { id: "scarf", label: "丝巾" },
  { id: "home", label: "家居" },
  { id: "new", label: "新品" },
]

const tieDyeProducts = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "扎染 T 恤",
    price: 128,
    originalPrice: 168,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    sales: 234,
    isNew: true,
    discount: 24,
    category: "服饰",
    tags: ["扎染", "T 恤", "手作"],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "扎染帆布包",
    price: 88,
    originalPrice: 118,
    image: "/indigo-dyed-canvas-bag.jpg",
    sales: 189,
    isNew: false,
    discount: 25,
    category: "配饰",
    tags: ["扎染", "帆布", "包袋"],
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "扎染壁挂",
    price: 268,
    originalPrice: 318,
    image: "/modern-indigo-dyeing-art.jpg",
    sales: 156,
    isNew: true,
    discount: 18,
    category: "家居",
    tags: ["扎染", "壁挂", "家居"],
  },
]

export default function TieDyePage() {
  return (
    <CategoryPageTemplate
      title="扎染专区"
      description="精选扎染工艺作品，每一件都保留手作纹样的独特变化。"
      bannerImage="/tie-dye-tutorial-hands-on.jpg"
      bannerTitle="扎染艺术"
      bannerDescription="传统工艺与现代设计结合后的鲜活纹理。"
      filterOptions={filterOptions}
      products={tieDyeProducts}
      categoryType="clothing"
    />
  )
}
