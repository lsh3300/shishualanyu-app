import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { SearchResultItem, SearchEntityType } from '@/types/search'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50
const FALLBACK_FETCH_CAP = 100

const TYPE_ALIASES: Record<string, SearchEntityType> = {
  products: 'product',
  product: 'product',
  goods: 'product',
  store: 'product',
  articles: 'article',
  article: 'article',
  posts: 'article',
  courses: 'course',
  course: 'course',
  videos: 'course',
  video: 'course',
}

function normalizeTypes(rawTypes: string[]): SearchEntityType[] {
  const normalized = rawTypes
    .map((type) => TYPE_ALIASES[type.toLowerCase()] || null)
    .filter((value): value is SearchEntityType => Boolean(value))

  return Array.from(new Set(normalized))
}

async function fallbackSearch(
  supabase: ReturnType<typeof createServiceClient>,
  query: string,
  filterTypes: SearchEntityType[],
  limit: number,
  offset: number
) {
  const trimmedQuery = query.trim()
  const filters = new Set(filterTypes)
  const fetchLimit = Math.min(limit + offset + 5, FALLBACK_FETCH_CAP)
  const results: SearchResultItem[] = []

  const shouldInclude = (type: SearchEntityType) =>
    !filterTypes.length || filters.has(type)

  console.log('回退查询开始:', { trimmedQuery, filterTypes, limit, offset, fetchLimit })

  if (shouldInclude('product')) {
    let builder = supabase
      .from('products')
      .select('id, slug, name, description, price, category, image_url, updated_at')
      .order('updated_at', { ascending: false })
      .limit(fetchLimit)

    if (trimmedQuery) {
      builder = builder.or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`)
    }

    const { data, error } = await builder
    if (error) {
      console.error('产品查询错误:', error)
    } else {
      console.log('产品查询成功:', { count: data?.length || 0, hasQuery: !!trimmedQuery })
    }
    if (data && data.length > 0) {
      // 获取产品图片
      const productIds = data.map((p: any) => p.id)
      const { data: mediaData } = await supabase
        .from('product_media')
        .select('product_id, url')
        .in('product_id', productIds)
        .eq('type', 'image')
        .order('cover', { ascending: false })
        .order('position', { ascending: true })
      
      const mediaMap: Record<string, string> = {}
      if (mediaData) {
        mediaData.forEach((m: any) => {
          if (!mediaMap[m.product_id]) {
            mediaMap[m.product_id] = m.url
          }
        })
      }

      results.push(
        ...data.map((item: any) => ({
          entity_type: 'product' as const,
          entity_id: item.id,
          slug: item.slug,
          title: item.name,
          summary: item.description,
          cover_image: mediaMap[item.id] || item.image_url || '/placeholder.svg',
          price: item.price !== null ? Number(item.price) : null,
          tags: item.category ? [item.category] : [],
          updated_at: item.updated_at,
          score: null,
        }))
      )
    }
  }

  if (shouldInclude('course')) {
    let builder = supabase
      .from('courses')
      .select('id, slug, title, description, price, category, image_url, updated_at')
      .order('updated_at', { ascending: false })
      .limit(fetchLimit)

    if (trimmedQuery) {
      builder = builder.or(`title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`)
    }

    const { data, error } = await builder
    if (error) {
      console.error('课程查询错误:', error)
    } else {
      console.log('课程查询成功:', { count: data?.length || 0, hasQuery: !!trimmedQuery })
    }
    if (data) {
      results.push(
        ...data.map((item: any) => ({
          entity_type: 'course' as const,
          entity_id: item.id,
          slug: item.slug,
          title: item.title,
          summary: item.description,
          cover_image: item.image_url || '/placeholder.svg',
          price: item.price !== null ? Number(item.price) : null,
          tags: item.category ? [item.category] : [],
          updated_at: item.updated_at,
          score: null,
        }))
      )
    }
  }

  if (shouldInclude('article')) {
    let builder = supabase
      .from('culture_articles')
      .select('id, slug, title, excerpt, content, cover_image, tags, read_time, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(fetchLimit)

    if (trimmedQuery) {
      builder = builder.or(`title.ilike.%${trimmedQuery}%,excerpt.ilike.%${trimmedQuery}%,content.ilike.%${trimmedQuery}%`)
    }

    const { data, error } = await builder
    if (error) {
      console.error('文章查询错误:', error)
    } else {
      console.log('文章查询成功:', { count: data?.length || 0, hasQuery: !!trimmedQuery })
    }
    if (data) {
      results.push(
        ...data.map((item: any) => ({
          entity_type: 'article' as const,
          entity_id: item.id,
          slug: item.slug,
          title: item.title,
          summary: item.excerpt || (item.content ? item.content.slice(0, 160) : null),
          cover_image: item.cover_image || '/placeholder.svg',
          price: null,
          tags: item.tags || [],
          updated_at: item.updated_at,
          score: null,
        }))
      )
    }
  }

  const sorted = results.sort((a, b) => {
    const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return bTime - aTime
  })

  const paged = sorted.slice(offset, offset + limit)
  const hasMore = sorted.length > offset + paged.length

  console.log('回退查询完成:', { total: sorted.length, paged: paged.length, hasMore })
  return { results: paged, hasMore }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(Number(searchParams.get('page') ?? '1'), 1)
  const limitParam = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)
  const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT)
  const offset = (page - 1) * limit

  const rawTypes =
    searchParams.getAll('type').length > 0
      ? searchParams.getAll('type')
      : (searchParams.get('types')?.split(',') ?? [])

  const filterTypes = normalizeTypes(rawTypes)

  try {
    const supabase = createServiceClient()
    console.log('搜索请求参数:', { query, filterTypes, limit, offset })
    
    const { data, error } = await supabase.rpc('search_content', {
      query: query || null,
      filter_types: filterTypes.length ? filterTypes : null,
      limit_count: limit,
      offset_count: offset,
    })

    let results: SearchResultItem[] = Array.isArray(data) ? data : []
    let hasMore = results.length === limit

    // 如果 RPC 失败或返回空结果，使用回退查询
    if (error) {
      console.warn('search_content RPC 失败，使用回退查询:', error.message, error)
      const fallback = await fallbackSearch(supabase, query, filterTypes, limit, offset)
      results = fallback.results
      hasMore = fallback.hasMore
      console.log('回退查询结果:', { count: results.length, hasMore })
    } else if (results.length === 0 && query) {
      // RPC 成功但返回空结果，可能是全文搜索配置问题，尝试回退查询
      console.log('RPC 返回空结果，尝试回退查询')
      const fallback = await fallbackSearch(supabase, query, filterTypes, limit, offset)
      if (fallback.results.length > 0) {
        results = fallback.results
        hasMore = fallback.hasMore
        console.log('回退查询找到结果:', { count: results.length, hasMore })
      } else {
        console.log('RPC 和回退查询都返回空结果')
      }
    } else {
      console.log('RPC 查询成功:', { count: results.length, hasMore })
    }

    return NextResponse.json({
      query,
      types: filterTypes,
      page,
      limit,
      hasMore,
      results,
    })
  } catch (err) {
    console.error('搜索 API 错误:', err)
    // 即使出错也尝试使用回退查询
    try {
      const supabase = createServiceClient()
      const fallback = await fallbackSearch(supabase, query, filterTypes, limit, offset)
      return NextResponse.json({
        query,
        types: filterTypes,
        page,
        limit,
        hasMore: fallback.hasMore,
        results: fallback.results,
      })
    } catch (fallbackErr) {
      console.error('回退查询也失败:', fallbackErr)
      return NextResponse.json({ error: '搜索失败，请稍后再试' }, { status: 500 })
    }
  }
}

