"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AssignmentsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  // 在客户端渲染完成后，从localStorage获取登录状态
  useEffect(() => {
    const savedLoggedInState = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(savedLoggedInState)
  }, [])

  // 模拟待完成作业数据
  const pendingAssignments = [
    {
      id: "assign1",
      title: "蓝染基础练习",
      courseName: "蓝染基础入门",
      dueDate: "2023-12-15",
      progress: 30,
      image: "/tie-dye-tutorial-hands-on.jpg"
    },
    {
      id: "assign2",
      title: "扎染图案设计",
      courseName: "高级扎染技法",
      dueDate: "2023-12-20",
      progress: 0,
      image: "/modern-indigo-dyeing-art.jpg"
    }
  ]

  // 模拟已完成作业数据
  const completedAssignments = [
    {
      id: "assign3",
      title: "蓝染色彩搭配",
      courseName: "蓝染基础入门",
      completedDate: "2023-11-28",
      score: 92,
      feedback: "色彩搭配协调，技法运用熟练",
      image: "/indigo-dyed-linen-tea-mat.jpg"
    }
  ]

  // 计算截止日期剩余天数
  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // 获取截止日期状态
  const getDateStatus = (dueDate) => {
    const daysRemaining = getDaysRemaining(dueDate)
    if (daysRemaining < 0) return "overdue"
    if (daysRemaining <= 3) return "urgent"
    return "normal"
  }

  // 如果未登录，显示提示登录界面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-2xl font-bold mt-4">我的作业</h1>
              <p className="text-muted-foreground mt-2">登录后可以查看您的课程作业</p>
            </div>
            <Link href="/profile">
              <Button className="w-full">去登录</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">我的作业</h1>
          </div>
        </div>
      </header>

      {/* 标签页 */}
      <div className="p-4">
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pending">待完成 ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="completed">已完成 ({completedAssignments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0">
            {pendingAssignments.length > 0 ? (
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => {
                  const dateStatus = getDateStatus(assignment.dueDate)
                  const daysRemaining = getDaysRemaining(assignment.dueDate)
                  
                  return (
                    <Card key={assignment.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          <img 
                            src={assignment.image} 
                            alt={assignment.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                          
                          <div className="flex items-center mt-2">
                            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-xs">
                              截止日期: {assignment.dueDate}
                            </span>
                            
                            {dateStatus === "overdue" && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                已逾期
                              </Badge>
                            )}
                            
                            {dateStatus === "urgent" && (
                              <Badge variant="warning" className="ml-2 text-xs bg-amber-500">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                还剩 {daysRemaining} 天
                              </Badge>
                            )}
                            
                            {dateStatus === "normal" && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                还剩 {daysRemaining} 天
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>完成进度</span>
                          <span>{assignment.progress}%</span>
                        </div>
                        <Progress value={assignment.progress} className="h-1.5" />
                      </div>
                      
                      <div className="px-4 pb-4 flex gap-2">
                        <Button variant="outline" className="flex-1">查看详情</Button>
                        <Button className="flex-1">继续完成</Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">暂无待完成作业</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            {completedAssignments.length > 0 ? (
              <div className="space-y-4">
                {completedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                        <img 
                          src={assignment.image} 
                          alt={assignment.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                        
                        <div className="flex items-center mt-2">
                          <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                          <span className="text-xs">
                            完成日期: {assignment.completedDate}
                          </span>
                          
                          <Badge className="ml-2 text-xs bg-green-500">
                            得分: {assignment.score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4">
                      <div className="text-sm font-medium mb-1">教师评语:</div>
                      <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                    </div>
                    
                    <div className="px-4 pb-4">
                      <Button variant="outline" className="w-full">查看详情</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">暂无已完成作业</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}