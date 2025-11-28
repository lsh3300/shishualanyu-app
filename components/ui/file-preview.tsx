'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  RotateCw, 
  Maximize2, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFileCache } from '@/hooks/use-file-cache';
import { toast } from '@/hooks/use-toast';

interface FilePreviewProps {
  file: {
    name: string;
    path: string;
    type: string;
    url?: string;
    isLocal?: boolean;
  };
  open: boolean;
  onClose: () => void;
  showControls?: boolean;
  allowDownload?: boolean;
  className?: string;
}

interface FileInfo {
  name: string;
  path: string;
  type: string;
  url: string;
  isLocal: boolean;
}

export function FilePreview({
  file,
  open,
  onClose,
  showControls = true,
  allowDownload = true,
  className = ''
}: FilePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { getFileUrl } = useFileCache();

  // 获取文件URL
  useEffect(() => {
    if (!open || !file) return;
    
    const fetchFileUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 如果已有URL，直接使用
        if (file.url) {
          setFileUrl(file.url);
          return;
        }
        
        // 否则通过API获取URL（bucket 使用默认值）
        const url = await getFileUrl(file.path, undefined, file.isLocal);
        setFileUrl(url);
      } catch (err) {
        console.error('获取文件URL失败:', err);
        setError('无法加载文件');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileUrl();
  }, [open, file, getFileUrl]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  // 获取文件类型
  const getFileType = (type: string): 'image' | 'video' | 'pdf' | 'other' => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type === 'application/pdf') return 'pdf';
    return 'other';
  };

  // 下载文件
  const handleDownload = async () => {
    try {
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

  // 分享文件
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.name,
          text: `查看文件: ${file.name}`,
          url: fileUrl
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(fileUrl);
        toast({
          title: '链接已复制',
          description: '文件链接已复制到剪贴板'
        });
      }
    } catch (error) {
      console.error('分享文件失败:', error);
      toast({
        title: '分享文件失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // 旋转控制
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 渲染文件内容
  const renderFileContent = () => {
    const fileType = getFileType(file.type);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium mb-2">无法加载文件</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={onClose}>关闭</Button>
        </div>
      );
    }
    
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center overflow-auto h-96 bg-gray-50">
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              <img
                src={fileUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
                onDoubleClick={handleResetZoom}
              />
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="flex items-center justify-center h-96 bg-black">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        );
        
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-96">
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={file.name}
            />
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">{file.name}</h3>
            <p className="text-gray-500 mb-4">此文件类型不支持预览</p>
            {allowDownload && (
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载文件
              </Button>
            )}
          </div>
        );
    }
  };

  // 渲染控制按钮
  const renderControls = () => {
    const fileType = getFileType(file.type);
    
    return (
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center space-x-2">
          {fileType === 'image' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <span className="text-sm text-gray-500">
            {file.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {allowDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl ${className}`}>
        <DialogHeader>
          <DialogTitle>文件预览</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-0">
          {renderFileContent()}
          {showControls && renderControls()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 文件画廊组件，用于预览多个文件
interface FileGalleryProps {
  files: FileInfo[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  showControls?: boolean;
  allowDownload?: boolean;
  className?: string;
}

export function FileGallery({
  files,
  initialIndex = 0,
  open,
  onClose,
  showControls = true,
  allowDownload = true,
  className = ''
}: FileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { getFileUrl } = useFileCache();

  // 获取当前文件
  const currentFile = files[currentIndex];

  // 获取文件URL
  useEffect(() => {
    if (!open || !currentFile) return;
    
    const fetchFileUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 如果已有URL，直接使用
        if (currentFile.url) {
          setFileUrl(currentFile.url);
          return;
        }
        
        // 否则通过API获取URL（bucket 使用默认值）
        const url = await getFileUrl(currentFile.path, undefined, currentFile.isLocal);
        setFileUrl(url);
      } catch (err) {
        console.error('获取文件URL失败:', err);
        setError('无法加载文件');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileUrl();
  }, [open, currentFile, getFileUrl]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setZoom(1);
      setRotation(0);
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // 获取文件类型
  const getFileType = (type: string): 'image' | 'video' | 'pdf' | 'other' => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type === 'application/pdf') return 'pdf';
    return 'other';
  };

  // 导航控制
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
      setRotation(0);
    }
  };

  // 下载当前文件
  const handleDownload = async () => {
    try {
      // 创建隐藏的a标签来触发下载
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = currentFile.name;
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

  // 分享当前文件
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentFile.name,
          text: `查看文件: ${currentFile.name}`,
          url: fileUrl
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(fileUrl);
        toast({
          title: '链接已复制',
          description: '文件链接已复制到剪贴板'
        });
      }
    } catch (error) {
      console.error('分享文件失败:', error);
      toast({
        title: '分享文件失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // 旋转控制
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, files.length, onClose]);

  // 渲染文件内容
  const renderFileContent = () => {
    if (!currentFile) {
      return (
        <div className="flex items-center justify-center h-96">
          <p>没有文件可显示</p>
        </div>
      );
    }
    
    const fileType = getFileType(currentFile.type);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium mb-2">无法加载文件</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={onClose}>关闭</Button>
        </div>
      );
    }
    
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center overflow-auto h-96 bg-gray-50 relative">
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                  onClick={goToNext}
                  disabled={currentIndex === files.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              <img
                src={fileUrl}
                alt={currentFile.name}
                className="max-w-full max-h-full object-contain"
                onDoubleClick={handleResetZoom}
              />
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="flex items-center justify-center h-96 bg-black relative">
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToNext}
                  disabled={currentIndex === files.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        );
        
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-96 relative">
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToNext}
                  disabled={currentIndex === files.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={currentFile.name}
            />
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center relative">
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
                  onClick={goToNext}
                  disabled={currentIndex === files.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">{currentFile.name}</h3>
            <p className="text-gray-500 mb-4">此文件类型不支持预览</p>
            {allowDownload && (
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载文件
              </Button>
            )}
          </div>
        );
    }
  };

  // 渲染控制按钮
  const renderControls = () => {
    if (!currentFile) return null;
    
    const fileType = getFileType(currentFile.type);
    
    return (
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center space-x-2">
          {fileType === 'image' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <span className="text-sm text-gray-500">
            {currentFile.name} ({currentIndex + 1} / {files.length})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {allowDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl ${className}`}>
        <DialogHeader>
          <DialogTitle>文件预览</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-0">
          {renderFileContent()}
          {showControls && renderControls()}
        </div>
      </DialogContent>
    </Dialog>
  );
}