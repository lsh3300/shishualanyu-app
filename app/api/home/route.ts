import { NextResponse } from "next/server"
import featuredProductsConfig from "@/data/homepage-featured-products.json"
import { createServiceClient } from "@/lib/supabaseClient"
import { getCourseVisualPriority, getCuratedVideoCover } from "@/lib/course-cover-presets"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"

export const revalidate = 120

type BannerItem = {
  id: string
  title: string
  subtitle: string
  image: string
  href: string
  tag: string
}

type HomeCourse = {
  id: string
  slug?: string
  title: string
  duration: string
  students: number
  imageUrl: string
  price: "free" | number
  level: string
}

type HomeProduct = {
  id: string
  name: string
  price: number | null
  sales: string
  imageUrl: string
  tag: string | null
}

type HomeArticle = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string
  readTime: number
  category: string
  views: number
}

type ProductRow = {
  id: string
  name: string
  price: number | null
  inventory: number | null
  status: string | null
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    const featuredProductIds = featuredProductsConfig.map((product) => product.id)
    const featuredProductTagMap = new Map(
      featuredProductsConfig.map((product) => [product.id, product.tag ?? null])
    )

    const curatedBannerItems: BannerItem[] = [
      {
        id: "curated-banner-1",
        title: "蓝白纹样里的东方秩序",
        subtitle: "从花叶纹样与靛蓝层次里，读懂蓝染图案背后的审美节奏与日常气质。",
        image: resolveStaticAssetUrl("/article-banners/indigo-pattern-fabric.jpg") || "/article-banners/indigo-pattern-fabric.jpg",
        href: "/culture",
        tag: "纹样之美",
      },
      {
        id: "curated-banner-2",
        title: "把蓝染体验放进一部 App",
        subtitle: "从图像浏览、课程学习到互动创作，让传统工艺以更轻盈的方式进入当代屏幕。",
        image: resolveStaticAssetUrl("/article-banners/indigo-app-vision.jpg") || "/article-banners/indigo-app-vision.jpg",
        href: "/culture",
        tag: "数字传播",
      },
      {
        id: "curated-banner-3",
        title: "一浸一染，看见工艺温度",
        subtitle: "真正打动人的不只是成品，更是双手进入染缸、材料慢慢显色的过程本身。",
        image: resolveStaticAssetUrl("/article-banners/indigo-dyeing-process.jpg") || "/article-banners/indigo-dyeing-process.jpg",
        href: "/culture",
        tag: "工艺现场",
      },
      {
        id: "curated-banner-4",
        title: "从技艺走向生活器物",
        subtitle: "当蓝染进入包袋、织物与家居用品，传统文化也就有了被日常持续使用的可能。",
        image: resolveStaticAssetUrl("/article-banners/indigo-lifestyle-products.jpg") || "/article-banners/indigo-lifestyle-products.jpg",
        href: "/culture",
        tag: "生活转化",
      },
    ]

    const [coursesResult, curatedProductsResult, fallbackProductsResult, articlesResult] = await Promise.all([
      supabase
        .from("courses")
        .select("id, slug, title, duration, students, image_url, video_url, is_free, price, difficulty, description")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("id, name, price, inventory, status")
        .in("id", featuredProductIds)
        .eq("status", "published"),
      supabase
        .from("products")
        .select("id, name, price, inventory, status")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("culture_articles")
        .select("id, slug, title, excerpt, cover_image, read_time, category")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

    if (coursesResult.error) throw coursesResult.error
    if (curatedProductsResult.error) throw curatedProductsResult.error
    if (fallbackProductsResult.error) throw fallbackProductsResult.error
    if (articlesResult.error) throw articlesResult.error

    const curatedProductsById = new Map(
      ((curatedProductsResult.data || []) as ProductRow[]).map((product) => [product.id, product])
    )
    const orderedCuratedProducts = featuredProductIds
      .map((id) => curatedProductsById.get(id))
      .filter((product): product is ProductRow => Boolean(product))
    const fallbackProducts = ((fallbackProductsResult.data || []) as ProductRow[]).filter(
      (product) => !featuredProductIds.includes(product.id)
    )
    const selectedProducts = [...orderedCuratedProducts, ...fallbackProducts].slice(0, 4)

    const productIds = selectedProducts.map((product) => product.id)
    const productMediaResult =
      productIds.length > 0
        ? await supabase
            .from("product_media")
            .select("product_id, url, cover, position, type")
            .in("product_id", productIds)
            .eq("type", "image")
            .order("position", { ascending: true })
        : { data: [], error: null }

    if (productMediaResult.error) throw productMediaResult.error

    const productImageMap = (productMediaResult.data || []).reduce<Record<string, string[]>>((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = []
      acc[item.product_id].push(item.url)
      return acc
    }, {})

    const featuredCourses: HomeCourse[] = (coursesResult.data || [])
      .filter((course) => Boolean(course.image_url || course.video_url))
      .sort((a, b) => {
        const aPriority = getCourseVisualPriority(a.image_url, a.video_url)
        const bPriority = getCourseVisualPriority(b.image_url, b.video_url)
        return bPriority - aPriority
      })
      .map((course, index) => ({
        id: course.id,
        slug: course.slug || undefined,
        title: course.title || "",
        duration: course.duration || "30分钟",
        students: course.students || 0,
        imageUrl:
          course.image_url ||
          (course.video_url ? getCuratedVideoCover(index) : null) ||
          "/placeholder.svg",
        price: course.is_free ? "free" : course.price || 0,
        level: course.difficulty || "入门",
      }))
      .slice(0, 6)

    const featuredProducts: HomeProduct[] = selectedProducts
      .map((product) => {
        const imageUrl = productImageMap[product.id]?.[0]
        if (!imageUrl) return null

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          sales: `${product.inventory || 0}人购`,
          imageUrl,
          tag: featuredProductTagMap.get(product.id) ?? null,
        }
      })
      .filter((item): item is HomeProduct => item !== null)

    const cultureArticles: HomeArticle[] = (articlesResult.data || [])
      .filter((article) => Boolean(article.cover_image) && article.cover_image !== "/placeholder.svg")
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.cover_image,
        readTime: article.read_time || 5,
        category: article.category || "文化",
        views: 0,
      }))

    const response = NextResponse.json({
      featuredCourses,
      featuredProducts,
      cultureArticles,
      bannerItems: curatedBannerItems,
    })

    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("获取首页聚合数据失败:", error)
    return NextResponse.json({ error: "获取首页数据失败" }, { status: 500 })
  }
}
