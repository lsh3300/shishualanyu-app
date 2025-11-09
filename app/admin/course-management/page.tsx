'use client'

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Trash2, Edit, Save, X, PlayCircle, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/ui/file-upload"
import { FileViewer } from "@/components/ui/file-viewer"
import { useFileCache } from "@/hooks/use-file-cache"
import { FileUtils } from "@/lib/file-utils"
import { toast } from "sonner"

interface Chapter {
  id: string
  title: string
  duration: string
  video?: string
  materials?: string[]
  description?: string
  isPreview?: boolean
}

interface Course {
  id: string
  title: string
  instructor: string
  instructorTitle: string
  instructorBio: string
  price: number
  originalPrice?: number
  image: string
  level: string
  duration: string
  lessons: number
  students: number
  rating: number
  description: string
  whatYouLearn: string[]
  materials: string[]
  chapters: Chapter[]
  category: string
  isNew?: boolean
  discount?: number
  isPublished?: boolean
}

export default function CourseManagementPage() {
  const router = useRouter()
  const { getFileUrl, uploadFile, deleteFile } = useFileCache()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("list")
  const [isEditing, setIsEditing] = useState(false)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [uploadedMaterials, setUploadedMaterials] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    instructorTitle: "",
    instructorBio: "",
    price: 0,
    originalPrice: 0,
    level: "",
    duration: "",
    lessons: 0,
    description: "",
    category: "",
    isNew: false,
    isPublished: true,
    whatYouLearn: [""]
  })

  // 章节数据
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "", title: "", duration: "", description: "", isPreview: false }
  ])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // 这里应该调用实际的API获取课程列表
      // 暂时使用模拟数据
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "蜡染纹样设计与应用",
          instructor: "王师傅",
          instructorTitle: "非遗传承人",
          instructorBio: "从事蜡染工艺30年，拥有丰富的教学和实践经验。",
          price: 298,
          originalPrice: 398,
          image: "/placeholder.svg",
          level: "初级",
          duration: "12小时",
          lessons: 24,
          students: 156,
          rating: 4.8,
          description: "本课程将带领学员深入了解蜡染的历史文化，学习传统蜡染纹样的设计原理和应用技巧。",
          whatYouLearn: [
            "了解蜡染的历史文化背景",
            "掌握蜡染纹样的设计原理",
            "学习蜡染的基本工艺流程",
            "创作自己的蜡染作品"
          ],
          materials: [
            "蜂蜡、白布、染料等基础材料",
            "蜡刀、画笔等工具",
            "纹样设计参考资料"
          ],
          chapters: [
            {
              id: "1",
              title: "蜡染历史文化介绍",
              duration: "45分钟",
              description: "介绍蜡染的起源、发展历史和文化意义",
              isPreview: true
            },
            {
              id: "2",
              title: "蜡染工具与材料准备",
              duration: "30分钟",
              description: "介绍蜡染所需的工具和材料，以及如何准备"
            }
          ],
          category: "蜡染",
          isNew: true,
          discount: 25,
          isPublished: true
        },
        {
          id: "2",
          title: "扎染基础技法",
          instructor: "李老师",
          instructorTitle: "扎染工艺师",
          instructorBio: "专注于扎染工艺研究15年，作品多次获奖。",
          price: 198,
          image: "/placeholder.svg",
          level: "初级",
          duration: "8小时",
          lessons: 16,
          students: 234,
          rating: 4.7,
          description: "本课程将教授扎染的基本技法，包括扎结方法、染色技巧等。",
          whatYouLearn: [
            "了解扎染的基本原理",
            "掌握不同的扎结方法",
            "学习染色技巧和色彩搭配",
            "完成扎染作品"
          ],
          materials: [
            "染料、白布等基础材料",
            "绳子、夹子等扎结工具",
            "色彩搭配参考资料"
          ],
          chapters: [
            {
              id: "1",
              title: "扎染工艺概述",
              duration: "30分钟",
              description: "介绍扎染的历史和基本原理",
              isPreview: true
            },
            {
              id: "2",
              title: "扎结基础技法",
              duration: "45分钟",
              description: "学习基本的扎结方法和技巧"
            }
          ],
          category: "扎染",
          isPublished: true
        }
      ]
      setCourses(mockCourses)
    } catch (error) {
      console.error("获取课程列表失败:", error)
      toast.error("获取课程列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course)
    setFormData({
      title: course.title,
      instructor: course.instructor,
      instructorTitle: course.instructorTitle,
      instructorBio: course.instructorBio,
      price: course.price,
      originalPrice: course.originalPrice || 0,
      level: course.level,
      duration: course.duration,
      lessons: course.lessons,
      description: course.description,
      category: course.category,
      isNew: course.isNew || false,
      isPublished: course.isPublished || true,
      whatYouLearn: course.whatYouLearn.length > 0 ? course.whatYouLearn : [""]
    })
    
    setChapters(course.chapters.length > 0 ? course.chapters : [{ id: "", title: "", duration: "", description: "", isPreview: false }])
    setUploadedImage(course.image)
    setUploadedMaterials(course.materials)
    setIsEditing(true)
    setActiveTab("edit")
  }

  const handleDeleteCourse = async (id: string) => {
    if (confirm("确定要删除这个课程吗？")) {
      try {
        // 这里应该调用实际的API删除课程
        setCourses(courses.filter(c => c.id !== id))
        toast.success("课程删除成功")
      } catch (error) {
        console.error("删除课程失败:", error)
        toast.error("删除课程失败")
      }
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    setIsUploading(true)
    try {
      const file = files[0]
      const isValid = FileUtils.validateImageFile(file)
      if (!isValid) {
        toast.error(`文件 ${file.name} 不是有效的图片文件`)
        return
      }
      
      const result = await uploadFile(file, "courses")
      if (result?.url) {
        setUploadedImage(result.url)
        toast.success("课程封面上传成功")
      }
    } catch (error) {
      console.error("上传图片失败:", error)
      toast.error("上传图片失败")
    } finally {
      setIsUploading(false)
    }
  }

  const handleMaterialsUpload = async (files: File[]) => {
    setIsUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const isValid = FileUtils.validateFile(file, 10 * 1024 * 1024) // 10MB
        if (!isValid) {
          toast.error(`文件 ${file.name} 超过大小限制或类型不支持`)
          return null
        }
        
        const result = await uploadFile(file, "course-materials")
        return result?.url || null
      })
      
      const results = await Promise.all(uploadPromises)
      const validUrls = results.filter(url => url !== null) as string[]
      
      setUploadedMaterials(prev => [...prev, ...validUrls])
      toast.success(`成功上传 ${validUrls.length} 个材料文件`)
    } catch (error) {
      console.error("上传材料失败:", error)
      toast.error("上传材料失败")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!uploadedImage) return
    
    try {
      await deleteFile(uploadedImage)
      setUploadedImage("")
      toast.success("课程封面删除成功")
    } catch (error) {
      console.error("删除图片失败:", error)
      toast.error("删除图片失败")
    }
  }

  const handleRemoveMaterial = async (index: number) => {
    const materialUrl = uploadedMaterials[index]
    try {
      await deleteFile(materialUrl)
      setUploadedMaterials(prev => prev.filter((_, i) => i !== index))
      toast.success("材料文件删除成功")
    } catch (error) {
      console.error("删除材料失败:", error)
      toast.error("删除材料失败")
    }
  }

  const handleChapterVideoUpload = async (chapterIndex: number, files: File[]) => {
    if (files.length === 0) return
    
    setIsUploading(true)
    try {
      const file = files[0]
      const isValid = FileUtils.validateVideoFile(file)
      if (!isValid) {
        toast.error(`文件 ${file.name} 不是有效的视频文件`)
        return
      }
      
      const result = await uploadFile(file, "course-videos")
      if (result?.url) {
        const updatedChapters = [...chapters]
        updatedChapters[chapterIndex].video = result.url
        setChapters(updatedChapters)
        toast.success("章节视频上传成功")
      }
    } catch (error) {
      console.error("上传视频失败:", error)
      toast.error("上传视频失败")
    } finally {
      setIsUploading(false)
    }
  }

  const handleChapterMaterialsUpload = async (chapterIndex: number, files: File[]) => {
    setIsUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const isValid = FileUtils.validateFile(file, 10 * 1024 * 1024) // 10MB
        if (!isValid) {
          toast.error(`文件 ${file.name} 超过大小限制或类型不支持`)
          return null
        }
        
        const result = await uploadFile(file, "chapter-materials")
        return result?.url || null
      })
      
      const results = await Promise.all(uploadPromises)
      const validUrls = results.filter(url => url !== null) as string[]
      
      const updatedChapters = [...chapters]
      if (!updatedChapters[chapterIndex].materials) {
        updatedChapters[chapterIndex].materials = []
      }
      updatedChapters[chapterIndex].materials = [...updatedChapters[chapterIndex].materials!, ...validUrls]
      setChapters(updatedChapters)
      toast.success(`成功上传 ${validUrls.length} 个章节材料文件`)
    } catch (error) {
      console.error("上传章节材料失败:", error)
      toast.error("上传章节材料失败")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCourse = async () => {
    try {
      const courseData: Course = {
        id: currentCourse?.id || Date.now().toString(),
        title: formData.title,
        instructor: formData.instructor,
        instructorTitle: formData.instructorTitle,
        instructorBio: formData.instructorBio,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        image: uploadedImage,
        level: formData.level,
        duration: formData.duration,
        lessons: formData.lessons,
        students: currentCourse?.students || 0,
        rating: currentCourse?.rating || 0,
        description: formData.description,
        whatYouLearn: formData.whatYouLearn.filter(item => item !== ""),
        materials: uploadedMaterials,
        chapters: chapters.filter(c => c.title !== ""),
        category: formData.category,
        isNew: formData.isNew,
        discount: formData.originalPrice && formData.originalPrice > formData.price 
          ? Math.round((1 - formData.price / formData.originalPrice) * 100) 
          : undefined,
        isPublished: formData.isPublished
      }

      if (isEditing && currentCourse) {
        // 更新课程
        setCourses(prev => prev.map(c => c.id === currentCourse.id ? courseData : c))
        toast.success("课程更新成功")
      } else {
        // 创建新课程
        setCourses(prev => [...prev, courseData])
        toast.success("课程创建成功")
      }

      // 重置表单
      resetForm()
      setActiveTab("list")
    } catch (error) {
      console.error("保存课程失败:", error)
      toast.error("保存课程失败")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      instructor: "",
      instructorTitle: "",
      instructorBio: "",
      price: 0,
      originalPrice: 0,
      level: "",
      duration: "",
      lessons: 0,
      description: "",
      category: "",
      isNew: false,
      isPublished: true,
      whatYouLearn: [""]
    })
    setChapters([{ id: "", title: "", duration: "", description: "", isPreview: false }])
    setUploadedImage("")
    setUploadedMaterials([])
    setCurrentCourse(null)
    setIsEditing(false)
  }

  const addChapter = () => {
    setChapters([...chapters, { 
      id: Date.now().toString(), 
      title: "", 
      duration: "", 
      description: "", 
      isPreview: false 
    }])
  }

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index))
  }

  const updateChapter = (index: number, field: string, value: any) => {
    setChapters(chapters.map((c, i) => 
      i === index ? { ...c, [field]: value } : c
    ))
  }

  const addWhatYouLearn = () => {
    setFormData({ ...formData, whatYouLearn: [...formData.whatYouLearn, ""] })
  }

  const updateWhatYouLearn = (index: number, value: string) => {
    setFormData({
      ...formData,
      whatYouLearn: formData.whatYouLearn.map((item, i) => i === index ? value : item)
    })
  }

  const removeWhatYouLearn = (index: number) => {
    setFormData({
      ...formData,
      whatYouLearn: formData.whatYouLearn.filter((_, i) => i !== index)
    })
  }

  const removeChapterMaterial = (chapterIndex: number, materialIndex: number) => {
    const updatedChapters = [...chapters]
    if (updatedChapters[chapterIndex].materials) {
      updatedChapters[chapterIndex].materials = updatedChapters[chapterIndex].materials!.filter((_, i) => i !== materialIndex)
      setChapters(updatedChapters)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="heading-secondary flex-1">课程管理</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              resetForm()
              setActiveTab("edit")
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加课程
          </Button>
        </div>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">课程列表</TabsTrigger>
            <TabsTrigger value="edit">编辑课程</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p>加载中...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <p>暂无课程数据</p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    resetForm()
                    setActiveTab("edit")
                  }}
                >
                  添加第一个课程
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {course.image && (
                            <FileViewer
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium truncate">{course.title}</h3>
                              <p className="text-sm text-muted-foreground">{course.instructor} · {course.category}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {course.isNew && (
                                <Badge variant="destructive" className="text-xs">新课</Badge>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {course.isPublished ? "已发布" : "草稿"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">¥{course.price}</span>
                              {course.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">¥{course.originalPrice}</span>
                              )}
                              <span className="text-sm text-muted-foreground">· {course.lessons}课时</span>
                              <span className="text-sm text-muted-foreground">· {course.students}人学习</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "编辑课程" : "添加新课程"}</CardTitle>
                <CardDescription>
                  {isEditing ? "更新课程信息。" : "填写课程详细信息。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">基本信息</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">课程标题</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="输入课程标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">课程分类</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择课程分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="蜡染">蜡染</SelectItem>
                          <SelectItem value="扎染">扎染</SelectItem>
                          <SelectItem value="刺绣">刺绣</SelectItem>
                          <SelectItem value="编织">编织</SelectItem>
                          <SelectItem value="陶艺">陶艺</SelectItem>
                          <SelectItem value="木工">木工</SelectItem>
                          <SelectItem value="剪纸">剪纸</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">课程描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="输入课程描述"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* 讲师信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">讲师信息</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instructor">讲师姓名</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        placeholder="输入讲师姓名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructorTitle">讲师头衔</Label>
                      <Input
                        id="instructorTitle"
                        value={formData.instructorTitle}
                        onChange={(e) => setFormData({ ...formData, instructorTitle: e.target.value })}
                        placeholder="输入讲师头衔"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructorBio">讲师简介</Label>
                      <Textarea
                        id="instructorBio"
                        value={formData.instructorBio}
                        onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })}
                        placeholder="输入讲师简介"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* 课程信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">课程信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">课程价格 (¥)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">原价 (¥)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">课程难度</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择课程难度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="入门">入门</SelectItem>
                          <SelectItem value="初级">初级</SelectItem>
                          <SelectItem value="中级">中级</SelectItem>
                          <SelectItem value="高级">高级</SelectItem>
                          <SelectItem value="专家">专家</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">课程时长</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="例如：12小时"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessons">课时数量</Label>
                      <Input
                        id="lessons"
                        type="number"
                        value={formData.lessons}
                        onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* 课程封面 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">课程封面</h3>
                  <FileUpload
                    onFilesSelected={handleImageUpload}
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    maxSize={5 * 1024 * 1024} // 5MB
                    disabled={isUploading}
                    className="w-full"
                  />
                  
                  {uploadedImage && (
                    <div className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <FileViewer
                          src={uploadedImage}
                          alt="课程封面"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* 学习收获 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">学习收获</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addWhatYouLearn}>
                      <Plus className="h-4 w-4 mr-1" />
                      添加收获
                    </Button>
                  </div>
                  {formData.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="输入学习收获"
                        value={item}
                        onChange={(e) => updateWhatYouLearn(index, e.target.value)}
                      />
                      {formData.whatYouLearn.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeWhatYouLearn(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 课程材料 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">课程材料</h3>
                  <FileUpload
                    onFilesSelected={handleMaterialsUpload}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    multiple={true}
                    maxFiles={10}
                    maxSize={10 * 1024 * 1024} // 10MB
                    disabled={isUploading}
                    className="w-full"
                  />
                  
                  {uploadedMaterials.length > 0 && (
                    <div className="space-y-2">
                      {uploadedMaterials.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm truncate max-w-xs">{url.split('/').pop()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMaterial(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 课程章节 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">课程章节</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addChapter}>
                      <Plus className="h-4 w-4 mr-1" />
                      添加章节
                    </Button>
                  </div>
                  {chapters.map((chapter, index) => (
                    <Card key={chapter.id || index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">章节 {index + 1}</h4>
                          {chapters.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeChapter(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`chapter-title-${index}`}>章节标题</Label>
                            <Input
                              id={`chapter-title-${index}`}
                              value={chapter.title}
                              onChange={(e) => updateChapter(index, "title", e.target.value)}
                              placeholder="输入章节标题"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`chapter-duration-${index}`}>章节时长</Label>
                            <Input
                              id={`chapter-duration-${index}`}
                              value={chapter.duration}
                              onChange={(e) => updateChapter(index, "duration", e.target.value)}
                              placeholder="例如：45分钟"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`chapter-description-${index}`}>章节描述</Label>
                            <Textarea
                              id={`chapter-description-${index}`}
                              value={chapter.description}
                              onChange={(e) => updateChapter(index, "description", e.target.value)}
                              placeholder="输入章节描述"
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              id={`chapter-preview-${index}`}
                              type="checkbox"
                              checked={chapter.isPreview}
                              onChange={(e) => updateChapter(index, "isPreview", e.target.checked)}
                            />
                            <Label htmlFor={`chapter-preview-${index}`}>设为试看章节</Label>
                          </div>
                          <div className="space-y-2">
                            <Label>章节视频</Label>
                            {chapter.video ? (
                              <div className="flex items-center gap-2 p-2 border rounded-md">
                                <PlayCircle className="h-4 w-4" />
                                <span className="text-sm truncate max-w-xs">{chapter.video.split('/').pop()}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(chapter.video, '_blank')}
                                >
                                  预览
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateChapter(index, "video", "")}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <FileUpload
                                onFilesSelected={(files) => handleChapterVideoUpload(index, files)}
                                accept="video/*"
                                multiple={false}
                                maxFiles={1}
                                maxSize={100 * 1024 * 1024} // 100MB
                                disabled={isUploading}
                                className="w-full"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>章节材料</Label>
                            <FileUpload
                              onFilesSelected={(files) => handleChapterMaterialsUpload(index, files)}
                              accept="image/*,application/pdf,.doc,.docx,.txt"
                              multiple={true}
                              maxFiles={5}
                              maxSize={10 * 1024 * 1024} // 10MB
                              disabled={isUploading}
                              className="w-full"
                            />
                            {chapter.materials && chapter.materials.length > 0 && (
                              <div className="space-y-2">
                                {chapter.materials.map((material, materialIndex) => (
                                  <div key={materialIndex} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm truncate max-w-xs">{material.split('/').pop()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(material, '_blank')}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeChapterMaterial(index, materialIndex)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* 其他选项 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">其他选项</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isPublished"
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <Label htmlFor="isPublished">立即发布</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isNew"
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    <Label htmlFor="isNew">新课标记</Label>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                  <Button onClick={handleSaveCourse} disabled={!formData.title || !formData.price || !uploadedImage || chapters.every(c => !c.title)}>
                    <Save className="h-4 w-4 mr-1" />
                    保存课程
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}