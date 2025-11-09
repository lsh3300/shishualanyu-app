import { CategoryPageTemplate } from "@/components/templates/category-page-template"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染" },
  { id: "wax-resist", label: "蜡染" },
  { id: "indigo", label: "蓝染" },
  { id: "new", label: "新品" },
  { id: "discount", label: "优惠" },
]

const clothingProducts = [
  {
    id: "clothing-1",
    name: "手工扎染丝巾",
    price: 168,
    originalPrice: 228,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    sales: 234,
    isNew: true,
    discount: 26,
    category: "clothing",
  },
  {
    id: "clothing-2",
    name: "蓝染棉麻衬衫",
    price: 298,
    image: "/indigo-dyed-linen-tea-mat.jpg",
    sales: 156,
    category: "clothing",
  },
  {
    id: "clothing-3",
    name: "传统蜡染旗袍",
    price: 588,
    originalPrice: 688,
    image: "/traditional-wax-resist-cushion.jpg",
    sales: 89,
    discount: 15,
    category: "clothing",
  },
  {
    id: "clothing-4",
    name: "扎染棉质T恤",
    price: 158,
    image: "/placeholder.svg",
    sales: 123,
    isNew: true,
    category: "clothing",
  },
  {
    id: "clothing-5",
    name: "蓝染牛仔外套",
    price: 398,
    originalPrice: 458,
    image: "/modern-indigo-dyed-fashion-products.jpg",
    sales: 67,
    discount: 13,
    category: "clothing",
  },
  {
    id: "clothing-6",
    name: "蜡染丝质长裙",
    price: 468,
    image: "/placeholder.svg",
    sales: 45,
    isNew: true,
    category: "clothing",
  },
]

export default function ClothingPage() {
  return (
    <CategoryPageTemplate
      title="服饰精选"
      description="精选传统蓝染工艺与现代时尚设计的完美融合"
      bannerImage="/modern-indigo-dyed-fashion-products.jpg"
      bannerTitle="传统工艺 现代风尚"
      bannerDescription="每一件服饰都是传统工艺与现代设计的完美结合"
      filterOptions={filterOptions}
      products={clothingProducts}
      categoryType="clothing"
    />
  )
}