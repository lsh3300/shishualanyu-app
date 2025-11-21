import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface CultureArticleCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  readTime: string
}

export function CultureArticleCard({ id, title, excerpt, image, readTime }: CultureArticleCardProps) {
  return (
    <Link href={`/culture/${id}`} className="group">
      <Card className="cultural-card hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg bg-card">
        <div className="relative overflow-hidden rounded-t-xl">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={400}
            height={200}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{excerpt}</p>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime} 阅读
          </div>
        </div>
      </Card>
    </Link>
  )
}
