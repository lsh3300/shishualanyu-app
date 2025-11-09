'use client'

import { ProductEditPage } from './page'

interface ProductEditDynamicPageProps {
  params: {
    id: string
  }
}

export default function ProductEditDynamicPage({ params }: ProductEditDynamicPageProps) {
  return <ProductEditPage params={params} />
}