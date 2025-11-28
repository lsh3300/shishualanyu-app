"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pause, Lightbulb, Star, Trophy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GameCanvas } from "@/indigo-craft-game/components/GameCanvas"
import { GameToolbar } from "@/indigo-craft-game/components/GameToolbar"
import { useGameStore } from "@/indigo-craft-game/hooks/use-game-store"
import { getLevelById } from "@/indigo-craft-game/data/levels"

const STAGE_STEPS = ['prepare', 'fold', 'tie', 'dye', 'reveal'] as const

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const levelId = parseInt(params.id as string)
  
  // Zustand 状态管理
  const {
    currentSession,
    isPaused,
    showHint,
    selectedTool,
    startLevel,
    updateStage,
    performAction,
    undoAction,
    togglePause,
    toggleHint,
    selectTool,
    endLevel,
    resetSession,
  } = useGameStore()
  
  const [elapsedTime, setElapsedTime] = useState(0)

  // 加载关卡配置
  const levelConfig = getLevelById(levelId)
  
  // 初始化关卡
  useEffect(() => {
    if (!currentSession && levelConfig) {
      startLevel(levelId)
    }
  }, [levelId, levelConfig, currentSession, startLevel])

  // 计时器
  useEffect(() => {
    if (currentSession && !isPaused) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - currentSession.startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentSession, isPaused])

  if (!levelConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">关卡不存在</h2>
          <Button onClick={() => router.push("/indigo-game")}>返回选关</Button>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const safeCurrentStage: (typeof STAGE_STEPS)[number] =
    currentSession?.currentStage && STAGE_STEPS.includes(currentSession.currentStage as (typeof STAGE_STEPS)[number])
      ? (currentSession.currentStage as (typeof STAGE_STEPS)[number])
      : 'prepare'

  const currentStageIndex = STAGE_STEPS.indexOf(safeCurrentStage)
  const progressPercent = ((currentStageIndex + 1) / STAGE_STEPS.length) * 100

  const handleCompleteStage = () => {
    if (!currentSession) return
    
    const nextIndex = currentStageIndex + 1
    if (nextIndex < STAGE_STEPS.length) {
      updateStage(STAGE_STEPS[nextIndex])
    } else {
      // 关卡完成
      const result = {
        levelId,
        completed: true,
        stars: 3, // 临时给满星
        score: 100,
        similarity: 0.95,
        timeUsed: elapsedTime,
        coinsEarned: levelConfig.rewards.coins,
        expEarned: levelConfig.rewards.exp || 100,
        artworkImage: '',
      }
      endLevel(result)
      router.push("/indigo-game")
    }
  }

  const handleAction = (action: any) => {
    performAction(action)
  }

  const handleUndo = () => {
    undoAction()
  }

  const handlePreview = () => {
    alert("预览功能开发中...")
  }

  const canUndo = (currentSession?.actions.length || 0) > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 pb-6">
      {/* 顶部状态栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (confirm("确定要退出游戏吗？进度将不会保存")) {
                resetSession()
                router.push("/indigo-game")
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{levelConfig.name}</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((star) => (
                  <Star 
                    key={star} 
                    className="h-4 w-4 fill-gray-300 text-gray-300"
                  />
                ))}
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={togglePause}
          >
            <Pause className="h-5 w-5" />
          </Button>
        </div>

        {/* 步骤指示器 */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary">{formatTime(elapsedTime)}</Badge>
            <span className="text-muted-foreground">
              阶段 {currentStageIndex + 1}/{STAGE_STEPS.length}: 
              {currentSession?.currentStage === 'prepare' && ' 准备阶段'}
              {currentSession?.currentStage === 'fold' && ' 折叠布料'}
              {currentSession?.currentStage === 'tie' && ' 捆扎固定'}
              {currentSession?.currentStage === 'dye' && ' 浸染上色'}
              {currentSession?.currentStage === 'reveal' && ' 展开作品'}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleHint}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              提示
            </Button>
          </div>
        </div>
      </header>

      {/* 游戏主区域 */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* 提示卡片 */}
        {showHint && levelConfig.hints[currentStageIndex] && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">操作提示</p>
                  <p className="text-sm text-muted-foreground">
                    {levelConfig.hints[currentStageIndex]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Canvas 工作区 */}
        <GameCanvas
          width={levelConfig.fabricSize.width}
          height={levelConfig.fabricSize.height}
          fabricType={levelConfig.fabricType}
          currentTool={selectedTool}
          onAction={handleAction}
        />

        {/* 工具栏 */}
        <GameToolbar
          allowedTools={levelConfig.allowedTools}
          selectedTool={selectedTool}
          onSelectTool={selectTool}
          onUndo={handleUndo}
          onPreview={handlePreview}
          canUndo={canUndo}
        />

        {/* 完成当前阶段按钮 */}
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          size="lg"
          onClick={handleCompleteStage}
        >
          {currentStageIndex < STAGE_STEPS.length - 1 ? (
            <>继续下一步</>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              完成关卡
            </>
          )}
        </Button>

        {/* 步骤进度展示 */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">关卡流程</p>
            <div className="space-y-2">
              {STAGE_STEPS.map((stage, index) => (
                <div 
                  key={stage}
                  className={`flex items-center gap-2 text-sm ${
                    index === currentStageIndex 
                      ? 'text-indigo-600 font-semibold' 
                      : index < currentStageIndex 
                        ? 'text-emerald-600' 
                        : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    index < currentStageIndex 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : index === currentStageIndex
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStageIndex ? '✓' : index + 1}
                  </div>
                  <span>
                    {stage === 'prepare' && '准备材料'}
                    {stage === 'fold' && '折叠布料'}
                    {stage === 'tie' && '捆扎固定'}
                    {stage === 'dye' && '浸染上色'}
                    {stage === 'reveal' && '展开作品'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 暂停菜单 */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-80">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">游戏已暂停</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={togglePause}
                >
                  继续游戏
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    resetSession()
                    startLevel(levelId)
                    togglePause()
                  }}
                >
                  重新开始
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    if (confirm("确定要退出吗？进度不会保存")) {
                      resetSession()
                      router.push("/indigo-game")
                    }
                  }}
                >
                  退出关卡
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
