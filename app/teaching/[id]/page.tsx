'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Plus, X, Image as ImageIcon, Upload, PlayCircle, FileText } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { FileSelector } from "@/components/ui/file-selector"
import { useFileCache } from "@/hooks/use-file-cache"
import { getCourseById, updateCourse } from "@/data/models"
import { CourseDetailTemplate } from "@/components/templates/course-detail-template"

interface CourseDetailPageProps {
  params?: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter()
  const { uploadFile } = useFileCache()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("details")

  // 加载课程数据
  useEffect(() => {
    const courseId = params?.id || useParams().id
    if (courseId) {
      setIsLoading(true)
      try {
        const courseData = getCourseById(courseId)
        if (courseData) {
          setCourse(courseData)
        } else {
          toast.error("课程不存在")
          router.push("/teaching")
        }
      } catch (error) {
        console.error("加载课程数据失败:", error)
        toast.error("加载课程数据失败")
      } finally {
        setIsLoading(false)
      }
    }
  }, [params, router, useParams])

  // 处理课程更新
  const handleCourseUpdate = async (updatedCourse: any) => {
    setIsSaving(true)
    try {
      await updateCourse(course.id, updatedCourse)
      setCourse(updatedCourse)
      setIsEditing(false)
      toast.success("课程更新成功")
    } catch (error) {
      console.error("更新课程失败:", error)
      toast.error("更新课程失败")
    } finally {
      setIsSaving(false)
    }
  }

  // 处理封面图片上传
  const handleCoverImageUpload = async (files: File[]) => {
    if (files.length === 0 || !course) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "courses",
        metadata: {
          course: course.title || "unknown-course",
          type: "cover-image"
        }
      })
      
      const updatedCourse = {
        ...course,
        coverImage: result.url
      }
      
      await handleCourseUpdate(updatedCourse)
      toast.success("封面图片上传成功")
    } catch (error) {
      console.error("封面图片上传失败:", error)
      toast.error("封面图片上传失败")
    }
  }

  // 处理封面图片选择
  const handleCoverImageSelect = async (selectedFiles: any[]) => {
    if (selectedFiles.length === 0 || !course) return

    const updatedCourse = {
      ...course,
      coverImage: selectedFiles[0].url
    }
    
    await handleCourseUpdate(updatedCourse)
  }

  // 处理预览视频上传
  const handlePreviewVideoUpload = async (files: File[]) => {
    if (files.length === 0 || !course) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-videos",
        metadata: {
          course: course.title || "unknown-course",
          type: "preview-video"
        }
      })
      
      const updatedCourse = {
        ...course,
        previewVideo: result.url
      }
      
      await handleCourseUpdate(updatedCourse)
      toast.success("预览视频上传成功")
    } catch (error) {
      console.error("预览视频上传失败:", error)
      toast.error("预览视频上传失败")
    }
  }

  // 处理预览视频选择
  const handlePreviewVideoSelect = async (selectedFiles: any[]) => {
    if (selectedFiles.length === 0 || !course) return

    const updatedCourse = {
      ...course,
      previewVideo: selectedFiles[0].url
    }
    
    await handleCourseUpdate(updatedCourse)
  }

  // 处理章节视频上传
  const handleChapterVideoUpload = async (chapterId: string, files: File[]) => {
    if (files.length === 0 || !course) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-videos",
        metadata: {
          course: course.title || "unknown-course",
          type: "chapter-video",
          chapterId
        }
      })
      
      const updatedCourse = {
        ...course,
        chapters: course.chapters.map((chapter: any) => 
          chapter.id === chapterId ? { ...chapter, videoUrl: result.url } : chapter
        )
      }
      
      await handleCourseUpdate(updatedCourse)
      toast.success("章节视频上传成功")
    } catch (error) {
      console.error("章节视频上传失败:", error)
      toast.error("章节视频上传失败")
    }
  }

  // 处理章节视频选择
  const handleChapterVideoSelect = async (chapterId: string, selectedFiles: any[]) => {
    if (selectedFiles.length === 0 || !course) return

    const updatedCourse = {
      ...course,
      chapters: course.chapters.map((chapter: any) => 
        chapter.id === chapterId ? { ...chapter, videoUrl: selectedFiles[0].url } : chapter
      )
    }
    
    await handleCourseUpdate(updatedCourse)
  }

  // 处理材料文件上传
  const handleMaterialFileUpload = async (materialId: string, files: File[]) => {
    if (files.length === 0 || !course) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-materials",
        metadata: {
          course: course.title || "unknown-course",
          type: "course-material",
          materialId
        }
      })
      
      const updatedCourse = {
        ...course,
        materials: course.materials.map((material: any) => 
          material.id === materialId 
            ? { 
                ...material, 
                fileUrl: result.url,
                fileSize: files[0].size,
                fileType: files[0].type
              } 
            : material
        )
      }
      
      await handleCourseUpdate(updatedCourse)
      toast.success("课程材料上传成功")
    } catch (error) {
      console.error("课程材料上传失败:", error)
      toast.error("课程材料上传失败")
    }
  }

  // 处理材料文件选择
  const handleMaterialFileSelect = async (materialId: string, selectedFiles: any[]) => {
    if (selectedFiles.length === 0 || !course) return

    const updatedCourse = {
      ...course,
      materials: course.materials.map((material: any) => 
        material.id === materialId 
          ? { 
              ...material, 
              fileUrl: selectedFiles[0].url,
              fileSize: selectedFiles[0].size,
              fileType: selectedFiles[0].type
            } 
          : material
      )
    }
    
    await handleCourseUpdate(updatedCourse)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">课程不存在</h1>
          <p className="text-muted-foreground mb-4">您要查看的课程不存在或已被删除</p>
          <Button onClick={() => router.push("/teaching")}>
            返回课程
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">课程详情</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  取消
                </Button>
                <Button 
                  onClick={() => handleCourseUpdate(course)}
                  disabled={isSaving}
                >
                  {isSaving ? "保存中..." : "保存"}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">课程详情</TabsTrigger>
            <TabsTrigger value="media">媒体资源</TabsTrigger>
            <TabsTrigger value="chapters">课程章节</TabsTrigger>
            <TabsTrigger value="materials">课程材料</TabsTrigger>
          </TabsList>

          {/* 课程详情 */}
          <TabsContent value="details" className="mt-4">
            <CourseDetailTemplate course={course} courseType="course" />
          </TabsContent>

          {/* 媒体资源 */}
          <TabsContent value="media" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>课程封面</CardTitle>
                <CardDescription>管理课程封面图片</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.coverImage && (
                  <div className="space-y-2">
                    <Label>当前封面</Label>
                    <div className="relative w-48 h-48 bg-muted rounded-md overflow-hidden">
                      <img
                        src={course.coverImage}
                        alt="课程封面"
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={async () => {
                            const updatedCourse = { ...course, coverImage: "" }
                            await handleCourseUpdate(updatedCourse)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>上传新封面</Label>
                      <FileUpload
                        onFilesChange={handleCoverImageUpload}
                        accept="image/*"
                        multiple={false}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024} // 5MB
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>或从已上传的图片中选择</Label>
                      <FileSelector
                        onFilesSelected={handleCoverImageSelect}
                        bucket="courses"
                        accept="image"
                        multiple={false}
                        trigger={
                          <Button variant="outline" className="w-full">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            从文件库选择
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>预览视频</CardTitle>
                <CardDescription>管理课程预览视频</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.previewVideo && (
                  <div className="space-y-2">
                    <Label>当前预览视频</Label>
                    <div className="relative w-full max-w-md bg-muted rounded-md overflow-hidden">
                      <video
                        src={course.previewVideo}
                        controls
                        className="w-full h-auto"
                      />
                      {isEditing && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={async () => {
                            const updatedCourse = { ...course, previewVideo: "" }
                            await handleCourseUpdate(updatedCourse)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>上传新预览视频</Label>
                      <FileUpload
                        onFilesChange={handlePreviewVideoUpload}
                        accept="video/*"
                        multiple={false}
                        maxFiles={1}
                        maxSize={100 * 1024 * 1024} // 100MB
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>或从已上传的视频中选择</Label>
                      <FileSelector
                        onFilesSelected={handlePreviewVideoSelect}
                        bucket="course-videos"
                        accept="video"
                        multiple={false}
                        trigger={
                          <Button variant="outline" className="w-full">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            从文件库选择
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 课程章节 */}
          <TabsContent value="chapters" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>课程章节</CardTitle>
                <CardDescription>管理课程章节视频</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map((chapter: any, index: number) => (
                    <Card key={chapter.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">章节 {index + 1}: {chapter.title}</CardTitle>
                        <CardDescription>{chapter.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {chapter.videoUrl ? (
                          <div className="relative w-full max-w-md bg-muted rounded-md overflow-hidden">
                            <video
                              src={chapter.videoUrl}
                              controls
                              className="w-full h-auto"
                            />
                            {isEditing && (
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={async () => {
                                  const updatedCourse = {
                                    ...course,
                                    chapters: course.chapters.map((c: any) => 
                                      c.id === chapter.id ? { ...c, videoUrl: "" } : c
                                    )
                                  }
                                  await handleCourseUpdate(updatedCourse)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            暂无视频
                          </div>
                        )}
                        
                        {isEditing && (
                          <div className="flex gap-2">
                            <FileUpload
                              onFilesChange={(files) => handleChapterVideoUpload(chapter.id, files)}
                              accept="video/*"
                              multiple={false}
                              maxFiles={1}
                              maxSize={200 * 1024 * 1024} // 200MB
                              trigger={
                                <Button variant="outline" className="flex-1">
                                  <Upload className="h-4 w-4 mr-2" />
                                  上传视频
                                </Button>
                              }
                            />
                            
                            <FileSelector
                              onFilesSelected={(files) => handleChapterVideoSelect(chapter.id, files)}
                              bucket="course-videos"
                              accept="video"
                              multiple={false}
                              trigger={
                                <Button variant="outline" className="flex-1">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  选择视频
                                </Button>
                              }
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无章节
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 课程材料 */}
          <TabsContent value="materials" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>课程材料</CardTitle>
                <CardDescription>管理课程材料文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.materials && course.materials.length > 0 ? (
                  course.materials.map((material: any, index: number) => (
                    <Card key={material.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">材料 {index + 1}: {material.title}</CardTitle>
                        <CardDescription>{material.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {material.fileUrl ? (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1 truncate">
                              {material.title || "未命名文件"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const updatedCourse = {
                                  ...course,
                                  materials: course.materials.map((m: any) => 
                                    m.id === material.id ? { ...m, fileUrl: "" } : m
                                  )
                                }
                                await handleCourseUpdate(updatedCourse)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            暂无文件
                          </div>
                        )}
                        
                        {isEditing && (
                          <div className="flex gap-2">
                            <FileUpload
                              onFilesChange={(files) => handleMaterialFileUpload(material.id, files)}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                              multiple={false}
                              maxFiles={1}
                              maxSize={50 * 1024 * 1024} // 50MB
                              trigger={
                                <Button variant="outline" className="flex-1">
                                  <Upload className="h-4 w-4 mr-2" />
                                  上传文件
                                </Button>
                              }
                            />
                            
                            <FileSelector
                              onFilesSelected={(files) => handleMaterialFileSelect(material.id, files)}
                              bucket="course-materials"
                              accept="document"
                              multiple={false}
                              trigger={
                                <Button variant="outline" className="flex-1">
                                  <FileText className="h-4 w-4 mr-2" />
                                  选择文件
                                </Button>
                              }
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无材料
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
