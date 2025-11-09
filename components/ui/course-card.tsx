import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Clock, Play, Users } from "lucide-react"

interface CourseCardProps {
  id: string
  title: string
  instructor: string
  duration: string
  students: number
  thumbnail: string
  price?: number
  isFree?: boolean
}

export function CourseCard({ id, title, instructor, duration, students, thumbnail, price, isFree }: CourseCardProps) {
  return (
    <Link href={`/teaching/${id}`} className="group">
      <Card className="cultural-card hover:scale-105 transition-all duration-300 w-64 flex-shrink-0 shadow-md hover:shadow-lg bg-white">
        <div className="relative overflow-hidden rounded-t-xl">
          <OptimizedImage
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            width={256}
            height={144}
            className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110"
            lazy={true}
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
            <Play className="h-6 w-6 text-white fill-white transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{instructor}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {students}人学习
            </div>
            <div className="text-sm font-semibold text-accent">{isFree ? "免费" : `¥${price}`}</div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
