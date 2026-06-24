'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Clock } from "lucide-react"

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
  const difficultyColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-red-100 text-red-800"
  }[difficulty] || "bg-gray-100 text-gray-800"

  const difficultyText = {
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级"
  }[difficulty] || difficulty

  return (
    <section className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold line-clamp-2">{title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{category}</Badge>
              <Badge className={difficultyColor}>{difficultyText}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={instructor.avatar} alt={instructor.name} />
              <AvatarFallback>{instructor.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{instructor.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{instructor.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{students}人学习</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">课程介绍</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}