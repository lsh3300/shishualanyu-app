export type SearchEntityType = 'product' | 'course' | 'article'

export interface SearchResultItem {
  entity_type: SearchEntityType
  entity_id: string
  slug: string | null
  title: string | null
  summary: string | null
  cover_image: string | null
  price: number | null
  tags: string[] | null
  updated_at: string | null
  score: number | null
}

export interface SearchResponse {
  query: string
  types: SearchEntityType[]
  page: number
  limit: number
  hasMore: boolean
  results: SearchResultItem[]
}

