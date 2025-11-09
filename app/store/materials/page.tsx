'use client'
import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { MaterialCard } from "@/components/ui/material-card"
import { ArrowLeft, ShoppingCart, SearchIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

const filterOptions = [
  { id: "all", label: "全部" },
  { id: "tie-dye", label: "扎染材料" },
  { id: "wax-resist", label: "蜡染材料" },
  { id: "beginner", label: "初学者套装" },
  { id: "professional", label: "专业工具" },
  { id: "natural", label: "天然染料" },
]

const materialPackages = [
  {
    id: "1",
    name: "扎染入门材料包",
    price: 68,
    image: "/indigo-dyeing-workshop-students-learning.jpg",
    description: "包含棉布、橡皮筋、靛蓝染料等全套入门材料，适合初学者",
    category: "tie-dye",
    level: "beginner",
  },
  {
    id: "2",
    name: "专业扎染工具套装",
    price: 128,
    image: "/placeholder.svg",
    description: "专业扎染夹具、刷子、手套等工具，提升创作效率",
    category: "tie-dye",
    level: "professional",
  },
  {
    id: "3",
    name: "天然植物染料套装",
    price: 198,
    image: "/natural-plant-dyes.jpg",
    description: "苏木、蓝草、茜草等天然植物染料，环保健康",
    category: "tie-dye",
    level: "natural",
  },
  {
    id: "4",
    name: "蜡染入门材料包",
    price: 88,
    image: "/wax-resist-dyeing-technique.jpg",
    description: "蜂蜡、画笔、染料等蜡染基础材料，入门必备",
    category: "wax-resist",
    level: "beginner",
  },
  {
    id: "5",
    name: "专业蜡染工具套装",
    price: 158,
    image: "/placeholder.svg",
    description: "专业蜡染刀、熔炉、蜡锅等工具，适合进阶学习",
    category: "wax-resist",
    level: "professional",
  },
  {
    id: "6",
    name: "苗族传统蜡染染料",
    price: 228,
    image: "/traditional-miao-wax-resist-dye.jpg",
    description: "源自贵州苗族的传统蜡染配方，色彩鲜艳持久",
    category: "wax-resist",
    level: "natural",
  },
]

export default function MaterialsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const isMobile = useIsMobile()

  const filteredMaterials = selectedFilter === "all" 
    ? materialPackages 
    : materialPackages.filter(material => 
        material.category === selectedFilter || material.level === selectedFilter
      )

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-background border-b">
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full p-1 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">材料包</h1>
        </div>
        
        <div className="hidden md:flex">
          <SearchBar placeholder="搜索材料包..." />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <SearchIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto">
            <SearchBar placeholder="搜索材料包..." className="mt-4" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">手工染色材料</h2>
          <p className="text-muted-foreground">为您的扎染和蜡染创作提供优质材料</p>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          options={filterOptions} 
          selectedOption={selectedFilter} 
          onSelectOption={setSelectedFilter} 
        />

        {/* Material List */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} {...material} />
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-10 bg-muted p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">材料选购小贴士</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>初学者建议选择入门套装，包含所有基础工具和材料</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>天然染料更加环保，但需要更多的操作时间和技巧</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>购买前请确认您已了解相关课程的需求，避免重复购买</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}