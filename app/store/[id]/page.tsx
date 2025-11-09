'use client'

import { ProductDetailTemplate } from "@/components/templates/product-detail-template"
import { getProductById } from "@/data/models"
import { notFound } from "next/navigation"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id)
  
  if (!product) {
    notFound()
  }

  return <ProductDetailTemplate product={product} />
}
