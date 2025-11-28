'use client'
import { useState, useEffect, Suspense } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ServicesList } from "./custom-services"
import { CustomProcess } from "./custom-process"
import { CraftsmenTeam } from "./custom-craftsmen"
import { LazyFeaturedWorks, LazyFAQSection, LazyCTASection, FeaturedWorksSkeleton, FAQSectionSkeleton, CTASectionSkeleton } from "./custom-sections"

// 定制服务会从 Supabase 动态加载

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
  const [customServices, setCustomServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 从 Supabase 获取定制服务产品
  useEffect(() => {
    async function fetchCustomServices() {
      try {
        const supabase = createClient()
        
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', '定制服务')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('获取定制服务失败:', error)
          setCustomServices([])
          return
        }

        // 获取每个产品的封面图
        const servicesWithImages = await Promise.all(
          (products || []).map(async (product) => {
            const { data: media } = await supabase
              .from('product_media')
              .select('url')
              .eq('product_id', product.id)
              .eq('cover', true)
              .single()
            
            return {
              id: product.id,
              title: product.name,
              price: product.price,
              image: media?.url || '/placeholder.svg',
              description: product.description || '',
              popular: product.is_new || false,
            }
          })
        )
        
        setCustomServices(servicesWithImages)
      } catch (err) {
        console.error('获取定制服务异常:', err)
        setCustomServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchCustomServices()
  }, [])

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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">加载定制服务中...</p>
              </div>
            ) : customServices.length > 0 ? (
              <ServicesList services={customServices} />
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-4 text-6xl">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">定制服务即将开放</h3>
                  <p className="text-muted-foreground mb-6">
                    我们正在筹备专业的蓝染定制服务，敬请期待！
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/teaching">
                      <Button variant="default">
                        学习课程
                      </Button>
                    </Link>
                    <Link href="/store">
                      <Button variant="outline">
                        选购商品
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
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