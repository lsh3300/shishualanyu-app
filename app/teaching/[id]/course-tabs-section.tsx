import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play } from "lucide-react"

interface Chapter {
  id: string
  title: string
  duration: string
  isFree: boolean
}

interface CourseTabsSectionProps {
  chapters: Chapter[]
  description: string
  instructor: {
    name: string
    avatar: string
    bio: string
  }
}

export function CourseTabsSection({
  chapters,
  description,
  instructor
}: CourseTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "details">("chapters")

  return (
    <>
      {/* Tabs */}
      <section className="px-4 mb-6">
        <div className="flex gap-4 border-b border-border">
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chapters" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("chapters")}
          >
            目录
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("details")}
          >
            详情
          </button>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-4 mb-6">
        {activeTab === "chapters" && (
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <Card key={chapter.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1">{chapter.title}</h4>
                    <p className="text-sm text-muted-foreground">{chapter.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.isFree && (
                      <Badge variant="secondary" className="text-xs">
                        免费
                      </Badge>
                    )}
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-secondary mb-4">课程介绍</h3>
              <p className="body-text mb-4">{description}</p>
              <p className="body-text">
                通过本课程的学习，您将掌握传统扎染的核心技法，了解不同图案的制作方法，
                并能够独立完成简单的扎染作品。课程内容由浅入深，适合零基础学员。
              </p>
            </div>

            <div>
              <h3 className="heading-secondary mb-4">讲师介绍</h3>
              <div className="flex gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={instructor.avatar || "/placeholder.svg"}
                    alt={instructor.name}
                  />
                  <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{instructor.name}</h4>
                  <p className="body-text">{instructor.bio}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}