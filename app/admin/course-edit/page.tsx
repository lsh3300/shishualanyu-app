'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon, Upload, PlayCircle, FileText } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { FileSelector } from "@/components/ui/file-selector"
import { useFileCache } from "@/hooks/use-file-cache"
import { getCourseById, updateCourse, createCourse } from "@/data/models"

interface Chapter {
  id: string
  title: string
  description: string
  videoUrl: string
  duration: number
  order: number
  isFree: boolean
}

interface Material {
  id: string
  title: string
  description: string
  fileUrl: string
  fileSize: number
  fileType: string
  order: number
}

interface CourseFormData {
  id?: string
  title: string
  description: string
  instructor: string
  category: string
  level: string
  duration: number
  price: number
  originalPrice?: number
  coverImage: string
  previewVideo?: string
  tags: string[]
  chapters: Chapter[]
  materials: Material[]
  enrolledCount: number
  rating: number
  reviewCount: number
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

interface CourseEditPageProps {
  params?: {
    id: string
  }
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const router = useRouter()
  const { uploadFile } = useFileCache()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isNewCourse, setIsNewCourse] = useState(!params?.id)
  const [newTag, setNewTag] = useState("")
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    instructor: "",
    category: "",
    level: "",
    duration: 0,
    price: 0,
    originalPrice: 0,
    coverImage: "",
    previewVideo: "",
    tags: [],
    chapters: [],
    materials: [],
    enrolledCount: 0,
    rating: 0,
    reviewCount: 0,
    isPublished: false
  })

  // 加载课程数据
  useEffect(() => {
    if (params?.id) {
      setIsLoading(true)
      try {
        const course = getCourseById(params.id)
        if (course) {
          setFormData({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            category: course.category,
            level: course.level,
            duration: course.duration,
            price: course.price,
            originalPrice: course.originalPrice,
            coverImage: course.coverImage,
            previewVideo: course.previewVideo,
            tags: course.tags,
            chapters: course.chapters || [],
            materials: course.materials || [],
            enrolledCount: course.enrolledCount,
            rating: course.rating,
            reviewCount: course.reviewCount,
            isPublished: course.isPublished
          })
        } else {
          toast.error("课程不存在")
          router.push("/admin/course-management")
        }
      } catch (error) {
        console.error("加载课程数据失败:", error)
        toast.error("加载课程数据失败")
      } finally {
        setIsLoading(false)
      }
    }
  }, [params?.id, router])

  // 处理表单字段变化
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理文件上传
  const handleCoverImageUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "courses",
        metadata: {
          course: formData.title || "new-course",
          type: "cover-image"
        }
      })
      
      setFormData(prev => ({
        ...prev,
        coverImage: result.url
      }))
      
      toast.success("封面图片上传成功")
    } catch (error) {
      console.error("封面图片上传失败:", error)
      toast.error("封面图片上传失败")
    }
  }

  // 处理预览视频上传
  const handlePreviewVideoUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-videos",
        metadata: {
          course: formData.title || "new-course",
          type: "preview-video"
        }
      })
      
      setFormData(prev => ({
        ...prev,
        previewVideo: result.url
      }))
      
      toast.success("预览视频上传成功")
    } catch (error) {
      console.error("预览视频上传失败:", error)
      toast.error("预览视频上传失败")
    }
  }

  // 处理封面图片选择
  const handleCoverImageSelect = (selectedFiles: any[]) => {
    if (selectedFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        coverImage: selectedFiles[0].url
      }))
    }
  }

  // 处理预览视频选择
  const handlePreviewVideoSelect = (selectedFiles: any[]) => {
    if (selectedFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        previewVideo: selectedFiles[0].url
      }))
    }
  }

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  // 删除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // 添加章节
  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      order: formData.chapters.length + 1,
      isFree: false
    }
    
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }))
  }

  // 更新章节
  const updateChapter = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter => 
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    }))
  }

  // 删除章节
  const removeChapter = (id: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(chapter => chapter.id !== id)
    }))
  }

  // 处理章节视频上传
  const handleChapterVideoUpload = async (chapterId: string, files: File[]) => {
    if (files.length === 0) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-videos",
        metadata: {
          course: formData.title || "new-course",
          type: "chapter-video",
          chapterId
        }
      })
      
      updateChapter(chapterId, "videoUrl", result.url)
      toast.success("章节视频上传成功")
    } catch (error) {
      console.error("章节视频上传失败:", error)
      toast.error("章节视频上传失败")
    }
  }

  // 处理章节视频选择
  const handleChapterVideoSelect = (chapterId: string, selectedFiles: any[]) => {
    if (selectedFiles.length > 0) {
      updateChapter(chapterId, "videoUrl", selectedFiles[0].url)
    }
  }

  // 添加材料
  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      title: "",
      description: "",
      fileUrl: "",
      fileSize: 0,
      fileType: "",
      order: formData.materials.length + 1
    }
    
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }))
  }

  // 更新材料
  const updateMaterial = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material => 
        material.id === id ? { ...material, [field]: value } : material
      )
    }))
  }

  // 删除材料
  const removeMaterial = (id: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material.id !== id)
    }))
  }

  // 处理材料文件上传
  const handleMaterialFileUpload = async (materialId: string, files: File[]) => {
    if (files.length === 0) return

    try {
      const result = await uploadFile(files[0], {
        bucket: "course-materials",
        metadata: {
          course: formData.title || "new-course",
          type: "course-material",
          materialId
        }
      })
      
      updateMaterial(materialId, "fileUrl", result.url)
      updateMaterial(materialId, "fileSize", files[0].size)
      updateMaterial(materialId, "fileType", files[0].type)
      toast.success("课程材料上传成功")
    } catch (error) {
      console.error("课程材料上传失败:", error)
      toast.error("课程材料上传失败")
    }
  }

  // 处理材料文件选择
  const handleMaterialFileSelect = (materialId: string, selectedFiles: any[]) => {
    if (selectedFiles.length > 0) {
      updateMaterial(materialId, "fileUrl", selectedFiles[0].url)
      updateMaterial(materialId, "fileSize", selectedFiles[0].size)
      updateMaterial(materialId, "fileType", selectedFiles[0].type)
    }
  }

  // 保存课程
  const handleSave = async () => {
    // 表单验证
    if (!formData.title.trim()) {
      toast.error("请输入课程标题")
      return
    }
    
    if (!formData.description.trim()) {
      toast.error("请输入课程描述")
      return
    }
    
    if (!formData.instructor.trim()) {
      toast.error("请输入讲师名称")
      return
    }
    
    if (!formData.coverImage) {
      toast.error("请上传课程封面图片")
      return
    }

    setIsSaving(true)
    try {
      if (formData.id) {
        // 更新课程
        await updateCourse(formData.id, formData)
        toast.success("课程更新成功")
      } else {
        // 创建课程
        await createCourse(formData)
        toast.success("课程创建成功")
      }
      
      router.push("/admin/course-management")
    } catch (error) {
      console.error("保存课程失败:", error)
      toast.error("保存课程失败")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h1 className="text-xl font-semibold">
              {isNewCourse ? "创建课程" : "编辑课程"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/course-management")}
            >
              取消
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="media">媒体资源</TabsTrigger>
            <TabsTrigger value="chapters">课程章节</TabsTrigger>
            <TabsTrigger value="materials">课程材料</TabsTrigger>
            <TabsTrigger value="settings">发布设置</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>设置课程的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">课程标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="请输入课程标题"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructor">讲师</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleFieldChange("instructor", e.target.value)}
                    placeholder="请输入讲师名称"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">课程分类</Label>
                    <Select value={formData.category} onValueChange={(value) => handleFieldChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择课程分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="蜡染">蜡染</SelectItem>
                        <SelectItem value="扎染">扎染</SelectItem>
                        <SelectItem value="蓝染">蓝染</SelectItem>
                        <SelectItem value="刺绣">刺绣</SelectItem>
                        <SelectItem value="纺织">纺织</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">课程难度</Label>
                    <Select value={formData.level} onValueChange={(value) => handleFieldChange("level", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择课程难度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="初级">初级</SelectItem>
                        <SelectItem value="中级">中级</SelectItem>
                        <SelectItem value="高级">高级</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">课程描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="请输入课程描述"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">售价</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">原价</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ""}
                      onChange={(e) => handleFieldChange("originalPrice", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">课程时长（分钟）</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleFieldChange("duration", Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>课程标签</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="添加标签"
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button onClick={addTag} disabled={!newTag.trim()}>
                      添加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 媒体资源 */}
          <TabsContent value="media" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>课程封面</CardTitle>
                <CardDescription>上传或选择课程封面图片</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.coverImage && (
                  <div className="space-y-2">
                    <Label>当前封面</Label>
                    <div className="relative w-48 h-48 bg-muted rounded-md overflow-hidden">
                      <img
                        src={formData.coverImage}
                        alt="课程封面"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleFieldChange("coverImage", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>预览视频</CardTitle>
                <CardDescription>上传或选择课程预览视频</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.previewVideo && (
                  <div className="space-y-2">
                    <Label>当前预览视频</Label>
                    <div className="relative w-full max-w-md bg-muted rounded-md overflow-hidden">
                      <video
                        src={formData.previewVideo}
                        controls
                        className="w-full h-auto"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleFieldChange("previewVideo", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* 课程章节 */}
          <TabsContent value="chapters" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>课程章节</CardTitle>
                    <CardDescription>添加和管理课程章节</CardDescription>
                  </div>
                  <Button onClick={addChapter}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加章节
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无章节，请点击"添加章节"按钮添加
                  </div>
                ) : (
                  formData.chapters.map((chapter, index) => (
                    <Card key={chapter.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">章节 {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeChapter(chapter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`chapter-title-${chapter.id}`}>章节标题</Label>
                          <Input
                            id={`chapter-title-${chapter.id}`}
                            value={chapter.title}
                            onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                            placeholder="请输入章节标题"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`chapter-description-${chapter.id}`}>章节描述</Label>
                          <Textarea
                            id={`chapter-description-${chapter.id}`}
                            value={chapter.description}
                            onChange={(e) => updateChapter(chapter.id, "description", e.target.value)}
                            placeholder="请输入章节描述"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`chapter-duration-${chapter.id}`}>时长（分钟）</Label>
                            <Input
                              id={`chapter-duration-${chapter.id}`}
                              type="number"
                              value={chapter.duration}
                              onChange={(e) => updateChapter(chapter.id, "duration", Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              id={`chapter-free-${chapter.id}`}
                              checked={chapter.isFree}
                              onCheckedChange={(checked) => updateChapter(chapter.id, "isFree", checked)}
                            />
                            <Label htmlFor={`chapter-free-${chapter.id}`}>免费试看</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>章节视频</Label>
                          {chapter.videoUrl && (
                            <div className="relative w-full max-w-md bg-muted rounded-md overflow-hidden mb-2">
                              <video
                                src={chapter.videoUrl}
                                controls
                                className="w-full h-auto"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => updateChapter(chapter.id, "videoUrl", "")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 课程材料 */}
          <TabsContent value="materials" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>课程材料</CardTitle>
                    <CardDescription>添加和管理课程材料</CardDescription>
                  </div>
                  <Button onClick={addMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加材料
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无材料，请点击"添加材料"按钮添加
                  </div>
                ) : (
                  formData.materials.map((material, index) => (
                    <Card key={material.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">材料 {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`material-title-${material.id}`}>材料标题</Label>
                          <Input
                            id={`material-title-${material.id}`}
                            value={material.title}
                            onChange={(e) => updateMaterial(material.id, "title", e.target.value)}
                            placeholder="请输入材料标题"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`material-description-${material.id}`}>材料描述</Label>
                          <Textarea
                            id={`material-description-${material.id}`}
                            value={material.description}
                            onChange={(e) => updateMaterial(material.id, "description", e.target.value)}
                            placeholder="请输入材料描述"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>材料文件</Label>
                          {material.fileUrl && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm flex-1 truncate">
                                {material.title || "未命名文件"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateMaterial(material.id, "fileUrl", "")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 发布设置 */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
                <CardDescription>设置课程的发布状态</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleFieldChange("isPublished", checked)}
                  />
                  <Label htmlFor="isPublished">发布课程</Label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formData.isPublished 
                    ? "课程已发布，学员可以看到并购买此课程" 
                    : "课程未发布，只有管理员可以看到此课程"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}