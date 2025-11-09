'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
  bucket?: string;
  destination?: string;
  isLocal?: boolean;
  accept?: string;
  maxSize?: number; // 字节
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  isLocal: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  bucket = 'products-images',
  destination = 'images/products',
  isLocal = false,
  accept = 'image/*,video/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = false,
  showPreview = true,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 检测文件类型
  const getFileType = (file: File): 'image' | 'video' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 验证文件
  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize) {
      return `文件大小超过限制 (${formatFileSize(maxSize)})`;
    }
    
    // 检查文件类型
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -2));
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        return `不支持的文件类型: ${file.type}`;
      }
    }
    
    return null;
  };

  // 上传单个文件
  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (isLocal) {
      formData.append('destination', destination);
    } else {
      formData.append('bucket', bucket);
    }
    
    const controller = new AbortController();
    abortControllersRef.current.set(file.name, controller);
    
    try {
      const response = await fetch(
        `/api/upload${isLocal ? '?local=true' : ''}`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }
      
      const data = await response.json();
      
      return {
        name: file.name,
        path: data.path,
        size: file.size,
        type: file.type,
        url: data.url,
        isLocal
      };
    } finally {
      abortControllersRef.current.delete(file.name);
    }
  }, [bucket, destination, isLocal]);

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles: UploadProgress[] = [];
    const validFiles: File[] = [];
    
    // 验证文件
    Array.from(selectedFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newFiles.push({
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        newFiles.push({
          file,
          progress: 0,
          status: 'pending'
        });
      }
    });
    
    // 检查文件数量限制
    if (files.length + validFiles.length > maxFiles) {
      toast({
        title: '文件数量超过限制',
        description: `最多只能上传 ${maxFiles} 个文件`,
        variant: 'destructive'
      });
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // 上传有效文件
    validFiles.forEach(file => {
      uploadWithProgress(file);
    });
  }, [files.length, maxFiles, uploadFile]);

  // 带进度上传
  const uploadWithProgress = async (file: File) => {
    try {
      // 更新状态为上传中
      setFiles(prev => 
        prev.map(f => 
          f.file.name === file.name 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      );
      
      // 模拟进度更新（实际应用中应该使用真实的上传进度）
      const progressInterval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => {
            if (f.file.name === file.name && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + 10, 90);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);
      
      // 上传文件
      const uploadedFile = await uploadFile(file);
      
      // 清除进度更新
      clearInterval(progressInterval);
      
      // 更新状态为成功
      setFiles(prev => 
        prev.map(f => 
          f.file.name === file.name 
            ? { ...f, status: 'success', progress: 100, url: uploadedFile.url }
            : f
        )
      );
      
      // 检查是否所有文件都已上传完成
      setFiles(prev => {
        const updatedFiles = prev.map(f => 
          f.file.name === file.name 
            ? { ...f, status: 'success', progress: 100, url: uploadedFile.url }
            : f
        );
        
        const completedFiles = updatedFiles.filter(f => f.status === 'success');
        const uploadedFiles = completedFiles.map(f => ({
          name: f.file.name,
          path: uploadedFile.path,
          size: f.file.size,
          type: f.file.type,
          url: f.url || uploadedFile.url,
          isLocal
        }));
        
        // 如果所有文件都已上传完成，调用回调
        if (updatedFiles.every(f => f.status === 'success' || f.status === 'error')) {
          onUploadComplete?.(uploadedFiles);
        }
        
        return updatedFiles;
      });
    } catch (error) {
      // 更新状态为错误
      setFiles(prev => 
        prev.map(f => 
          f.file.name === file.name 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
            : f
        )
      );
      
      onUploadError?.(error instanceof Error ? error : new Error('上传失败'));
    }
  };

  // 移除文件
  const removeFile = (fileName: string) => {
    // 如果文件正在上传，取消上传
    const controller = abortControllersRef.current.get(fileName);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileName);
    }
    
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // 渲染文件预览
  const renderFilePreview = (file: UploadProgress) => {
    const fileType = getFileType(file.file);
    const previewUrl = file.url || (fileType === 'image' ? URL.createObjectURL(file.file) : undefined);
    
    return (
      <Card key={file.file.name} className="relative">
        <CardContent className="p-2">
          <div className="flex items-center space-x-2">
            {fileType === 'image' && previewUrl && showPreview ? (
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt={file.file.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                {fileType === 'image' ? (
                  <FileImage className="w-6 h-6 text-gray-400" />
                ) : fileType === 'video' ? (
                  <FileVideo className="w-6 h-6 text-gray-400" />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded" />
                )}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
              
              {file.status === 'uploading' && (
                <Progress value={file.progress} className="h-1 mt-1" />
              )}
              
              {file.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{file.error}</p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => removeFile(file.file.name)}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-lg font-medium">点击或拖拽文件到此处上传</p>
        <p className="text-sm text-gray-500 mt-1">
          {accept !== '*' && `支持格式: ${accept}`}
          {maxSize && ` • 最大大小: ${formatFileSize(maxSize)}`}
          {maxFiles > 1 && ` • 最多 ${maxFiles} 个文件`}
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(renderFilePreview)}
        </div>
      )}
    </div>
  );
}