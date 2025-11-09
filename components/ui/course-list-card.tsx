import { Play, Clock, Users, Star } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CourseListCardProps {
  id: string
  title: string
  instructor: string
  duration: string
  students: number
  rating: number
  thumbnail: string
  price?: number
  isFree?: boolean
  difficulty: "入门" | "进阶" | "高级"
  category: string
}

export function CourseListCard({
  id,
  title,
  instructor,
  duration,
  students,
  rating,
  thumbnail,
  price,
  isFree,
  difficulty,
  category,
}: CourseListCardProps) {
  return (
    <Link href={`/teaching/${id}`}>
      <Card className="cultural-card hover:scale-105 transition-transform">
        <div className="flex gap-4">
          <div className="relative w-32 h-24 flex-shrink-0">
            <OptimizedImage src={thumbnail || "/placeholder.svg"} alt={title} fill className="object-cover rounded-lg" lazy={true} />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
              <Clock className="h-2 w-2" />
              {duration}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <Badge
                variant={difficulty === "入门" ? "default" : difficulty === "进阶" ? "secondary" : "destructive"}
                className="text-xs"
              >
                {difficulty}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{instructor}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {students}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {rating}
                </div>
              </div>
              <div className="font-semibold text-accent">{isFree ? "免费" : `¥${price}`}</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
