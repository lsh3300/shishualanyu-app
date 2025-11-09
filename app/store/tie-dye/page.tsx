import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "扎染", label: "扎染" },
  { id: "蜡染", label: "蜡染" },
  { id: "丝巾", label: "丝巾" },
  { id: "家居", label: "家居" },
  { id: "新品", label: "新品" },
]

const tieDyeProducts = [
  {
    id: "1",
    name: "手工扎染丝巾",
    price: 168,
    originalPrice: 228,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    sales: 234,
    isNew: true,
    discount: 26,
    category: "服饰",
    tags: ["扎染", "手工", "丝巾"],
  },
  {
    id: "2",
    name: "扎染帆布包",
    price: 98,
    originalPrice: 138,
    image: "/indigo-dyed-canvas-bag.jpg",
    sales: 189,
    isNew: false,
    discount: 29,
    category: "配饰",
    tags: ["扎染", "帆布", "包"],
  },
  {
    id: "3",
    name: "扎染茶席",
    price: 128,
    originalPrice: 168,
    image: "/indigo-dyed-linen-tea-mat.jpg",
    sales: 156,
    isNew: true,
    discount: 24,
    category: "家居",
    tags: ["扎染", "茶席", "亚麻"],
  },
  {
    id: "4",
    name: "扎染围巾",
    price: 138,
    originalPrice: 188,
    image: "/placeholder.svg",
    sales: 203,
    isNew: false,
    discount: 27,
    category: "服饰",
    tags: ["扎染", "围巾", "棉"],
  },
  {
    id: "5",
    name: "扎染桌布",
    price: 188,
    originalPrice: 258,
    image: "/placeholder.svg",
    sales: 87,
    isNew: true,
    discount: 27,
    category: "家居",
    tags: ["扎染", "桌布", "麻"],
  },
  {
    id: "6",
    name: "扎染抱枕",
    price: 78,
    originalPrice: 108,
    image: "/placeholder.svg",
    sales: 145,
    isNew: false,
    discount: 28,
    category: "家居",
    tags: ["扎染", "抱枕", "棉麻"],
  },
]

export default function TieDyePage() {
  return (
    <CategoryPageTemplate
      title="扎染专区"
      description="精选扎染工艺作品，每一件都是独一无二的艺术品"
      bannerImage="/tie-dye-tutorial-hands-on.jpg"
      bannerTitle="扎染艺术"
      bannerDescription="传统工艺与现代设计的完美结合"
      filterOptions={filterOptions}
      products={tieDyeProducts}
      categoryType="clothing"
    />
  )
}