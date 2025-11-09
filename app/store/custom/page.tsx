'use client'
import { useState, Suspense } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ServicesList } from "./custom-services"
import { CustomProcess } from "./custom-process"
import { CraftsmenTeam } from "./custom-craftsmen"
import { LazyFeaturedWorks, LazyFAQSection, LazyCTASection, FeaturedWorksSkeleton, FAQSectionSkeleton, CTASectionSkeleton } from "./custom-sections"

const customServices = [
  {
    id: "1",
    title: "私人定制扎染丝巾",
    price: 368,
    image: "/handmade-tie-dye-silk-scarf.jpg",
    description: "根据您的喜好定制独一无二的扎染丝巾，可以指定图案、颜色和尺寸",
    popular: true,
  },
  {
    id: "2",
    title: "苗族蜡染家居定制",
    price: 498,
    image: "/traditional-wax-resist-cushion.jpg",
    description: "定制传统苗族蜡染风格的家居饰品，包括抱枕、桌旗、茶席等",
    popular: true,
  },
  {
    id: "3",
    title: "企业礼品定制",
    price: 688,
    image: "/placeholder.svg",
    description: "为企业定制专属的扎染或蜡染礼品，可印logo，适合商务馈赠",
    popular: false,
  },
  {
    id: "4",
    title: "个性化服饰定制",
    price: 298,
    image: "/modern-indigo-dyed-fashion-products.jpg",
    description: "定制扎染或蜡染风格的T恤、衬衫、连衣裙等服饰",
    popular: false,
  },
]

const craftsmen = [
  {
    id: "1",
    name: "李师傅",
    title: "扎染技艺传承人",
    avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
    specialties: ["扎染", "丝巾设计", "传统工艺"],
    experience: "30年经验",
    rating: 5,
  },
  {
    id: "2",
    name: "王老师",
    title: "蜡染工艺大师",
    avatar: "/placeholder-user.jpg",
    specialties: ["蜡染", "家居设计", "民族图案"],
    experience: "25年经验",
    rating: 5,
  },
  {
    id: "3",
    name: "张设计师",
    title: "现代染艺设计",
    avatar: "/placeholder-user.jpg",
    specialties: ["现代设计", "服饰定制", "创意染艺"],
    experience: "15年经验",
    rating: 4,
  },
]

const customSteps = [
  {
    id: "1",
    title: "选择服务类型",
    description: "根据需求选择扎染、蜡染或其他定制服务",
  },
  {
    id: "2",
    title: "沟通设计需求",
    description: "与我们的设计师沟通您的具体需求和创意",
  },
  {
    id: "3",
    title: "确认设计方案",
    description: "我们会提供设计稿，确认无误后开始制作",
  },
  {
    id: "4",
    title: "制作与交付",
    description: "纯手工制作，完成后进行质量检查并发货",
  },
]

export default function CustomWorkshopPage() {
  const [activeTab, setActiveTab] = useState("services")

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-background border-b">
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full p-1 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">定制工坊</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-64">
        <Image 
          src="/modern-indigo-dyeing-art.jpg" 
          alt="定制工坊" 
          className="w-full h-full object-cover"
          width={1200}
          height={400}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-white text-3xl font-bold mb-2">专属定制，独一无二</h2>
          <p className="text-white/80">将您的创意与传统工艺完美结合，打造专属艺术品</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        <Button 
          variant={activeTab === "services" ? "default" : "ghost"} 
          className="flex-1 rounded-none border-b-2" 
          onClick={() => setActiveTab("services")}
        >
          定制服务
        </Button>
        <Button 
          variant={activeTab === "process" ? "default" : "ghost"} 
          className="flex-1 rounded-none border-b-2" 
          onClick={() => setActiveTab("process")}
        >
          定制流程
        </Button>
        <Button 
          variant={activeTab === "craftsmen" ? "default" : "ghost"} 
          className="flex-1 rounded-none border-b-2" 
          onClick={() => setActiveTab("craftsmen")}
        >
          匠人团队
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            {/* 服务列表 */}
            <ServicesList services={customServices} />
            
            {/* 精选作品 */}
            <Suspense fallback={<FeaturedWorksSkeleton />}>
              <LazyFeaturedWorks />
            </Suspense>
          </div>
        )}

        {/* Process Tab */}
        {activeTab === "process" && (
          <div>
            {/* 定制流程 */}
            <CustomProcess steps={customSteps} />
            
            {/* FAQ部分 */}
            <Suspense fallback={<FAQSectionSkeleton />}>
              <LazyFAQSection />
            </Suspense>
          </div>
        )}

        {/* Craftsmen Tab */}
        {activeTab === "craftsmen" && (
          <div>
            <h3 className="text-xl font-semibold mb-6">我们的匠人团队</h3>
            {/* 匠人团队 */}
            <CraftsmenTeam craftsmen={craftsmen} />
          </div>
        )}

        {/* CTA部分 */}
        <Suspense fallback={<CTASectionSkeleton />}>
          <LazyCTASection />
        </Suspense>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}