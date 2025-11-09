'use client';

import { useState, useEffect, useRef } from 'react';
import { useFileCache } from '@/hooks/use-file-cache';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface FileViewerProps {
  path: string;
  bucket?: string;
  isLocal?: boolean;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  showControls?: boolean;
  lazy?: boolean;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function FileViewer({
  path,
  bucket,
  isLocal = false,
  alt = '',
  className = '',
  width,
  height,
  showControls = false,
  lazy = true,
  fallback,
  onLoad,
  onError
}: FileViewerProps) {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [showPreview, setShowPreview] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { getFileUrl, preloadFile } = useFileCache({
    maxSize: 30,
    maxAge: 60 * 60 * 1000, // 1小时
    enableCache: true
  });

  // 检测文件类型
  const getFileType = (filePath: string): 'image' | 'video' | 'unknown' => {
    if (!filePath) return 'unknown';
    
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'mov', 'ogg'].includes(ext || '')) {
      return 'video';
    }
    
    return 'unknown';
  };

  // 懒加载检测
  useEffect(() => {
    if (!lazy || isVisible) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // 加载文件URL
  useEffect(() => {
    if (!isVisible || !path) return;
    
    const loadFile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fileUrl = await getFileUrl(path, bucket, isLocal);
        setUrl(fileUrl);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('加载文件失败');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFile();
  }, [path, bucket, isLocal, isVisible, getFileUrl, onError]);

  // 预加载文件
  const handlePreload = async () => {
    try {
      await preloadFile(path, bucket, isLocal);
    } catch (err) {
      console.error('预加载失败:', err);
    }
  };

  // 处理文件加载完成
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // 处理文件加载错误
  const handleError = () => {
    const error = new Error('文件加载失败');
    setError(error);
    setIsLoading(false);
    onError?.(error);
  };

  // 下载文件
  const handleDownload = () => {
    if (!url || !path) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = path.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileType = getFileType(path);
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';

  // 渲染加载状态
  if (isLoading) {
    return (
      <div 
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // 渲染错误状态
  if (error || !url) {
    return (
      <div 
        ref={containerRef}
        className={`relative flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        {fallback || (
          <div className="text-center p-4">
            <p className="text-sm">加载失败</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重试
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 渲染文件内容
  const renderFileContent = () => {
    if (isImage) {
      return (
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-contain"
          onLoad={handleLoad}
          onError={handleError}
        />
      );
    } else if (isVideo) {
      return (
        <video
          src={url}
          className="w-full h-full object-contain"
          controls={showPreview}
          onLoadedData={handleLoad}
          onError={handleError}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">不支持的文件类型</p>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {renderFileContent()}
      
      {showControls && (
        <div className="absolute top-2 right-2 flex space-x-2">
          {isVideo && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handlePreload}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}