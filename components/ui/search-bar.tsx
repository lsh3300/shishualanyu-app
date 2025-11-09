'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Search, X, History, Filter, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "./separator"
import { Badge } from "./badge"
import { useToast } from "@/hooks/use-toast"

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string, category?: string) => void
}

export function SearchBar({ 
  placeholder = "探索蓝染艺术、课程与文创...", 
  className,
  onSearch 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { toast } = useToast()
  
  // 搜索分类选项
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'courses', name: '课程' },
    { id: 'products', name: '产品' },
    { id: 'articles', name: '文章' },
    { id: 'materials', name: '材料' },
    { id: 'techniques', name: '技法' }
  ]
  
  // 热点搜索数据
  const hotSearches = [
    { text: '扎染入门教程', category: 'courses', hot: true },
    { text: '蓝染丝巾', category: 'products', hot: true },
    { text: '蜡染工艺', category: 'courses', hot: true },
    { text: '靛蓝染料', category: 'materials', hot: true },
    { text: '传统蓝染历史', category: 'articles', hot: true },
    { text: '手工扎染DIY', category: 'courses', new: true },
    { text: '蓝染帆布包', category: 'products', new: true },
    { text: '扎染技法大全', category: 'articles', hot: true },
  ]
  
  // 模拟搜索建议数据（当用户输入时）
  const mockSuggestions = [...hotSearches]
  
  // 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])
  
  // 保存搜索历史
  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }
  
  // 执行搜索
  const handleSearch = (query: string = searchQuery, category?: string) => {
    if (!query.trim()) return
    
    saveSearchToHistory(query)
    
    if (onSearch) {
      onSearch(query, category || selectedCategory || 'all')
    } else {
      // 简单的搜索提示，实际项目中这里会导航到搜索结果页或执行搜索
      toast({
        title: "搜索执行",
        description: `搜索内容: ${query}${category ? `, 分类: ${category}` : ''}`,
        variant: "default",
      })
      console.log('搜索:', { query, category: category || selectedCategory || 'all' })
    }
    
    setShowSuggestions(false)
  }
  
  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
    toast({
      title: "历史记录已清除",
      variant: "default",
    })
  }
  
  // 获取过滤后的建议
  const filteredSuggestions = mockSuggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedCategory || selectedCategory === 'all' || suggestion.category === selectedCategory)
  )
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(true)
  }
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setShowCategories(false)
      // 移除对searchInputRef的引用
    }
  }
  
  // 选择分类
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
    setShowCategories(false)
  }
  
  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    handleSearch(suggestion)
  }
  
  // 选择历史记录
  const selectHistory = (historyItem: string) => {
    setSearchQuery(historyItem)
    handleSearch(historyItem)
  }
  
  // 清除搜索框
  const clearSearch = () => {
    setSearchQuery('')
    // 清除后仍然保持建议框显示
    setShowSuggestions(true)
  }

  return (
    <div className={cn("relative group", className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        {/* 搜索图标 */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all group-hover:text-primary" />
        
        {/* 分类筛选按钮 */}
        <button 
          onClick={() => setShowCategories(!showCategories)}
          className="absolute left-9 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all hover:text-primary"
          aria-label="筛选搜索类别"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        
        {/* 搜索输入框 */}
        <Input 
          type="search" 
          placeholder={placeholder} 
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            // 点击时就显示建议框，不再检查输入长度
            setShowSuggestions(true)
          }}
          onBlur={() => {
            // 延迟关闭，让点击建议项能够正常工作
            setTimeout(() => {
              setIsFocused(false)
              setShowSuggestions(false)
              setShowCategories(false)
            }, 200)
          }}
          className="pl-16 pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/70"
        />
        
        {/* 清除按钮 */}
        {searchQuery && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all hover:text-muted-foreground/80 focus:outline-none"
            aria-label="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* 搜索按钮 */}
        <button 
          onClick={() => handleSearch()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all hover:bg-primary/90 focus:outline-none"
          aria-label="执行搜索"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      
      {/* 分类筛选下拉菜单 */}
      {showCategories && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-20 p-2">
          <div className="grid grid-cols-2 gap-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => selectCategory(category.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              >
                {category.name}
                {selectedCategory === category.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 搜索建议、历史记录和热点搜索下拉框 */}
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">搜索历史</span>
                </div>
                <button 
                  onClick={clearSearchHistory}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  清除
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => selectHistory(item)}
                    className="flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                  >
                    <History className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              {filteredSuggestions.length > 0 && <Separator className="my-2" />}
            </div>
          )}
          
          {/* 热点搜索 */}
          {!searchQuery && hotSearches.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">热点搜索</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {hotSearches.slice(0, 6).map((hot, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(hot.text)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    <span className="flex items-center">
                      {hot.hot && (
                        <Badge variant="destructive" className="text-[10px] h-4 mr-1.5">热</Badge>
                      )}
                      {hot.new && (
                        <Badge variant="secondary" className="text-[10px] h-4 mr-1.5">新</Badge>
                      )}
                      {hot.text}
                    </span>
                  </button>
                ))}
              </div>
              {searchQuery && filteredSuggestions.length > 0 && <Separator className="my-2" />}
            </div>
          )}
          
          {/* 搜索建议（当用户输入时） */}
          {searchQuery && filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">推荐搜索</span>
              </div>
              <div className="space-y-1">
                {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion.text)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                  >
                    <span>{suggestion.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.id === suggestion.category)?.name || suggestion.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 无结果提示 */}
          {searchQuery && filteredSuggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              没有找到相关建议
            </div>
          )}
        </div>
      )}
    </div>
  )
}
