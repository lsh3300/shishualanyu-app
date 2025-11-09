'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileImage, 
  FileVideo, 
  Download, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  Search,
  Grid,
  List,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FileViewer } from './file-viewer';
import { useFileCache } from '@/hooks/use-file-cache';

interface FileManagerProps {
  bucket?: string;
  isLocal?: boolean;
  onFileSelect?: (file: FileInfo) => void;
  onFileDelete?: (file: FileInfo) => void;
  selectable?: boolean;
  className?: string;
}

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  isLocal: boolean;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';

export function FileManager({
  bucket = 'products-images',
  isLocal = false,
  onFileSelect,
  onFileDelete,
  selectable = false,
  className = ''
}: FileManagerProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const { getFileUrl, preloadFile } = useFileCache();

  // 获取文件列表
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/files?bucket=${bucket}&local=${isLocal}`
      );
      
      if (!response.ok) {
        throw new Error('获取文件列表失败');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      toast({
        title: '获取文件列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除文件
  const deleteFile = async (file: FileInfo) => {
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: file.path,
          isLocal: file.isLocal
        })
      });
      
      if (!response.ok) {
        throw new Error('删除文件失败');
      }
      
      // 更新文件列表
      setFiles(prev => prev.filter(f => f.path !== file.path));
      
      toast({
        title: '文件已删除',
        description: file.name
      });
      
      onFileDelete?.(file);
    } catch (error) {
      console.error('删除文件失败:', error);
      toast({
        title: '删除文件失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  // 下载文件
  const downloadFile = async (file: FileInfo) => {
    try {
      const fileUrl = await getFileUrl(file.path, file.isLocal);
      
      // 创建隐藏的a标签来触发下载
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载文件失败:', error);
      toast({
        title: '下载文件失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取文件类型
  const getFileType = (file: FileInfo): 'image' | 'video' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  // 处理文件选择
  const handleFileSelect = (file: FileInfo) => {
    if (!selectable) return;
    
    const fileId = file.path;
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
    
    onFileSelect?.(file);
  };

  // 过滤文件
  useEffect(() => {
    let filtered = files;
    
    // 按类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(file => {
        const fileType = getFileType(file);
        return fileType === filterType;
      });
    }
    
    // 按搜索查询过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredFiles(filtered);
  }, [files, searchQuery, filterType]);

  // 初始加载
  useEffect(() => {
    fetchFiles();
  }, [bucket, isLocal]);

  // 预加载文件
  useEffect(() => {
    filteredFiles.forEach(file => {
      if (getFileType(file) === 'image') {
        preloadFile(file.path, file.isLocal);
      }
    });
  }, [filteredFiles, preloadFile]);

  // 渲染文件项
  const renderFileItem = (file: FileInfo) => {
    const fileType = getFileType(file);
    const isSelected = selectable && selectedFiles.includes(file.path);
    
    return (
      <Card 
        key={file.path} 
        className={`overflow-hidden transition-all ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${viewMode === 'list' ? 'mb-2' : ''}`}
        onClick={() => handleFileSelect(file)}
      >
        {viewMode === 'grid' ? (
          <div className="p-4">
            <div className="relative aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
              {fileType === 'image' ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {fileType === 'video' ? (
                    <FileVideo className="w-12 h-12 text-gray-400" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded" />
                  )}
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      查看
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file);
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
        ) : (
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {fileType === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {fileType === 'video' ? (
                      <FileVideo className="w-6 h-6 text-gray-400" />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(file);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>文件管理</CardTitle>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterType === 'all' ? '全部' : filterType === 'image' ? '图片' : '视频'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    全部
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('image')}>
                    图片
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('video')}>
                    视频
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || filterType !== 'all' ? '没有找到匹配的文件' : '暂无文件'}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' 
                : 'space-y-2'
            }>
              {filteredFiles.map(renderFileItem)}
            </div>
          )}
        </CardContent>
      </Card>
      
      {previewFile && (
        <FileViewer
          file={previewFile}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}