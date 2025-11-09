'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Lock, PlayCircle } from "lucide-react"

interface Chapter {
  id: string
  title: string
  duration: string
  isFree: boolean
}

interface Instructor {
  name: string
  avatar: string
  bio: string
}

interface CourseTabsSectionProps {
  chapters: Chapter[]
  description: string
  instructor: Instructor
}

export function CourseTabsSection({ chapters, description, instructor }: CourseTabsSectionProps) {
  const [activeTab, setActiveTab] = useState("chapters")

  return (
    <section className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chapters">课程章节</TabsTrigger>
          <TabsTrigger value="description">课程详情</TabsTrigger>
          <TabsTrigger value="instructor">讲师介绍</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chapters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">课程章节</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{chapter.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{chapter.duration}</span>
                      </div>
                      {chapter.isFree ? (
                        <Badge variant="secondary" className="text-xs">免费</Badge>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          <span>付费</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="description" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">课程详情</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">讲师介绍</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={instructor.avatar} alt={instructor.name} />
                  <AvatarFallback className="text-lg">{instructor.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">专业讲师</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{instructor.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}