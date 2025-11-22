"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RotateCw, 
  CircleDot, 
  Droplet, 
  Scissors,
  Undo,
  Eye,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tool {
  id: string
  name: string
  icon: LucideIcon
  description: string
  color: string
  isUnlocked: boolean
}

interface GameToolbarProps {
  allowedTools: string[]
  selectedTool: string | null
  onSelectTool: (toolId: string) => void
  onUndo: () => void
  onPreview: () => void
  canUndo: boolean
}

const TOOL_DEFINITIONS: Record<string, Tool> = {
  'fold-spiral': {
    id: 'fold-spiral',
    name: '螺旋折叠',
    icon: RotateCw,
    description: '从中心旋转折叠布料',
    color: 'text-indigo-600',
    isUnlocked: true,
  },
  'rubber-band': {
    id: 'rubber-band',
    name: '橡皮筋',
    icon: CircleDot,
    description: '点击添加捆扎点',
    color: 'text-amber-600',
    isUnlocked: true,
  },
  'dye-blue': {
    id: 'dye-blue',
    name: '靛蓝染液',
    icon: Droplet,
    description: '浸染蓝色',
    color: 'text-blue-600',
    isUnlocked: true,
  },
  'fold-accordion': {
    id: 'fold-accordion',
    name: '风琴折',
    icon: Scissors,
    description: '平行折叠',
    color: 'text-purple-600',
    isUnlocked: true,
  },
  'marker': {
    id: 'marker',
    name: '记号笔',
    icon: CircleDot,
    description: '标记位置',
    color: 'text-gray-600',
    isUnlocked: false,
  },
}

export function GameToolbar({
  allowedTools,
  selectedTool,
  onSelectTool,
  onUndo,
  onPreview,
  canUndo,
}: GameToolbarProps) {
  const tools = allowedTools
    .map(toolId => TOOL_DEFINITIONS[toolId])
    .filter(Boolean)

  return (
    <Card>
      <CardContent className="p-4">
        {/* 工具选择区 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">选择工具</h3>
          <div className="grid grid-cols-3 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isSelected = selectedTool === tool.id
              
              return (
                <Button
                  key={tool.id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "flex flex-col items-center gap-2 h-auto py-3 relative",
                    isSelected && "bg-indigo-600 hover:bg-indigo-700"
                  )}
                  onClick={() => onSelectTool(tool.id)}
                  disabled={!tool.isUnlocked}
                >
                  <Icon className={cn(
                    "h-6 w-6",
                    isSelected ? "text-white" : tool.color
                  )} />
                  <span className="text-xs">{tool.name}</span>
                  
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  )}
                  
                  {!tool.isUnlocked && (
                    <Badge className="absolute top-1 right-1 text-xs px-1">
                      锁定
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* 工具说明 */}
        {selectedTool && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">
                {TOOL_DEFINITIONS[selectedTool]?.name}:
              </span>{' '}
              {TOOL_DEFINITIONS[selectedTool]?.description}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4 mr-1" />
            撤销
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4 mr-1" />
            预览
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
