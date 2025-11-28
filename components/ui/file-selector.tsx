'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileImage, FileVideo, Search, FolderOpen, X, Plus } from 'lucide-react';
import { FileManager, FileInfo } from './file-manager';
import { useFileCache } from '@/hooks/use-file-cache';

interface FileSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  bucket?: string;
  isLocal?: boolean;
  accept?: 'image' | 'video' | 'all';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FileSelector({
  value,
  onChange,
  bucket = 'products-images',
  isLocal = false,
  accept = 'image',
  placeholder = '选择文件',
  disabled = false,
  className = ''
}: FileSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { getFileUrl } = useFileCache();

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
      let filteredFiles: FileInfo[] = (data.files || []) as FileInfo[];
      
      // 根据accept类型过滤文件
      if (accept !== 'all') {
        filteredFiles = filteredFiles.filter((file: FileInfo) => {
          if (accept === 'image') {
            return file.type.startsWith('image/');
          } else if (accept === 'video') {
            return file.type.startsWith('video/');
          }
          return true;
        });
      }
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据路径获取文件信息
  const getFileByPath = (path: string): FileInfo | null => {
    return files.find(file => file.path === path) || null;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型
  const getFileType = (file: FileInfo): 'image' | 'video' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  // 处理文件选择
  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
    onChange?.(file.path);
    setOpen(false);
  };

  // 清除选择
  const handleClear = () => {
    setSelectedFile(null);
    onChange?.('');
  };

  // 初始化
  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open, bucket, isLocal, accept]);

  // 根据value获取文件信息
  useEffect(() => {
    if (value && files.length > 0) {
      const file = getFileByPath(value);
      setSelectedFile(file);
    }
  }, [value, files]);

  // 渲染文件预览
  const renderFilePreview = (file: FileInfo) => {
    const fileType = getFileType(file);
    
    return (
      <div className="flex items-center space-x-3 p-2 border rounded-md">
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
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleClear}
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // 渲染文件选择对话框内容
  const renderDialogContent = () => {
    const filteredFiles = files.filter(file => {
      if (!searchQuery) return true;
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? '没有找到匹配的文件' : '暂无文件'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredFiles.map(file => {
              const fileType = getFileType(file);
              const isSelected = selectedFile?.path === file.path;
              
              return (
                <Card 
                  key={file.path} 
                  className={`cursor-pointer overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <CardContent className="p-3">
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
                            <FileVideo className="w-8 h-8 text-gray-400" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>选择文件</Label>
      
      {selectedFile ? (
        renderFilePreview(selectedFile)
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto p-4"
              disabled={disabled}
            >
              <FolderOpen className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-500">{placeholder}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>选择文件</DialogTitle>
            </DialogHeader>
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 多文件选择器组件
interface MultiFileSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  bucket?: string;
  isLocal?: boolean;
  accept?: 'image' | 'video' | 'all';
  placeholder?: string;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
}

export function MultiFileSelector({
  value = [],
  onChange,
  bucket = 'products-images',
  isLocal = false,
  accept = 'image',
  placeholder = '选择文件',
  disabled = false,
  maxFiles = 10,
  className = ''
}: MultiFileSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { getFileUrl } = useFileCache();

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
      let filteredFiles: FileInfo[] = (data.files || []) as FileInfo[];
      
      // 根据accept类型过滤文件
      if (accept !== 'all') {
        filteredFiles = filteredFiles.filter((file: FileInfo) => {
          if (accept === 'image') {
            return file.type.startsWith('image/');
          } else if (accept === 'video') {
            return file.type.startsWith('video/');
          }
          return true;
        });
      }
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据路径获取文件信息
  const getFilesByPaths = (paths: string[]): FileInfo[] => {
    return paths.map(path => files.find(file => file.path === path)).filter(Boolean) as FileInfo[];
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型
  const getFileType = (file: FileInfo): 'image' | 'video' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  // 处理文件选择
  const handleFileSelect = (file: FileInfo) => {
    const isSelected = selectedFiles.some(f => f.path === file.path);
    
    if (isSelected) {
      // 取消选择
      const newSelectedFiles = selectedFiles.filter(f => f.path !== file.path);
      setSelectedFiles(newSelectedFiles);
      onChange?.(newSelectedFiles.map(f => f.path));
    } else if (selectedFiles.length < maxFiles) {
      // 添加选择
      const newSelectedFiles = [...selectedFiles, file];
      setSelectedFiles(newSelectedFiles);
      onChange?.(newSelectedFiles.map(f => f.path));
    }
  };

  // 清除所有选择
  const handleClearAll = () => {
    setSelectedFiles([]);
    onChange?.([]);
  };

  // 移除单个文件
  const handleRemoveFile = (path: string) => {
    const newSelectedFiles = selectedFiles.filter(f => f.path !== path);
    setSelectedFiles(newSelectedFiles);
    onChange?.(newSelectedFiles.map(f => f.path));
  };

  // 初始化
  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open, bucket, isLocal, accept]);

  // 根据value获取文件信息
  useEffect(() => {
    if (value.length > 0 && files.length > 0) {
      const filesByPaths = getFilesByPaths(value);
      setSelectedFiles(filesByPaths);
    }
  }, [value, files]);

  // 渲染已选择的文件
  const renderSelectedFiles = () => {
    if (selectedFiles.length === 0) {
      return (
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto p-4"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2 text-gray-400" />
          <span className="text-gray-500">{placeholder}</span>
        </Button>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            已选择 {selectedFiles.length} 个文件
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={disabled}
          >
            清除全部
          </Button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedFiles.map(file => {
            const fileType = getFileType(file);
            
            return (
              <div key={file.path} className="flex items-center space-x-3 p-2 border rounded-md">
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {fileType === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {fileType === 'video' ? (
                        <FileVideo className="w-5 h-5 text-gray-400" />
                      ) : (
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleRemoveFile(file.path)}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
        
        {selectedFiles.length < maxFiles && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加更多文件
          </Button>
        )}
      </div>
    );
  };

  // 渲染文件选择对话框内容
  const renderDialogContent = () => {
    const filteredFiles = files.filter(file => {
      if (!searchQuery) return true;
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? '没有找到匹配的文件' : '暂无文件'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredFiles.map(file => {
              const fileType = getFileType(file);
              const isSelected = selectedFiles.some(f => f.path === file.path);
              
              return (
                <Card 
                  key={file.path} 
                  className={`cursor-pointer overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <CardContent className="p-3">
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
                            <FileVideo className="w-8 h-8 text-gray-400" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded" />
                          )}
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>选择文件</Label>
      
      <Dialog open={open} onOpenChange={setOpen}>
        {renderSelectedFiles()}
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择文件 (最多 {maxFiles} 个)</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}