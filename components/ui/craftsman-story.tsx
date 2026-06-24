import { Quote } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CraftsmanStoryProps {
  story: string
  author: string
  title: string
}

export function CraftsmanStory({ story, author, title }: CraftsmanStoryProps) {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 p-6">
      <div className="flex items-start gap-4">
        <Quote className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-primary mb-2">{title}</h4>
          <p className="body-text italic mb-3">{story}</p>
          <p className="text-sm text-muted-foreground">— {author}</p>
        </div>
      </div>
    </Card>
  )
}
