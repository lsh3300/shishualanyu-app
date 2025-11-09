import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Star, Clock } from "lucide-react"

interface CourseInfoSectionProps {
  title: string
  category: string
  difficulty: string
  instructor: {
    name: string
    avatar: string
    bio: string
  }
  students: number
  rating: number
  duration: string
  description: string
}

export function CourseInfoSection({
  title,
  category,
  difficulty,
  instructor,
  students,
  rating,
  duration,
  description
}: CourseInfoSectionProps) {
  return (
    <section className="px-4 mb-6">
      <div className="flex gap-2 mb-3">
        <Badge variant="secondary">{category}</Badge>
        <Badge variant="default">{difficulty}</Badge>
      </div>
      <h1 className="heading-primary mb-3">{title}</h1>

      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
          <AvatarFallback>{instructor.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{instructor.name}</p>
          <p className="text-sm text-muted-foreground">{instructor.bio}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {students} 人学习
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {rating} 评分
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {duration}
        </div>
      </div>

      <p className="body-text">{description}</p>
    </section>
  )
}