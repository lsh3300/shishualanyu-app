'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Loader2, User, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange?: (newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange,
  size = 'md',
  className = ''
}: AvatarUploadProps) {
  const { getToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 尺寸配置
  const sizeConfig = {
    sm: { container: 'w-16 h-16', icon: 'w-6 h-6', camera: 'w-5 h-5' },
    md: { container: 'w-24 h-24', icon: 'w-8 h-8', camera: 'w-6 h-6' },
    lg: { container: 'w-32 h-32', icon: 'w-10 h-10', camera: 'w-7 h-7' }
  };

  const config = sizeConfig[size];
  const displayUrl = previewUrl || currentAvatarUrl;

  // 上传头像
  const uploadAvatar = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('请先登录');
        setPreviewUrl(null);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      // 上传成功，更新显示
      setPreviewUrl(null);
      onAvatarChange?.(data.avatar_url);

    } catch (err) {
      console.error('上传头像失败:', err);
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // 清空 input，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [getToken, onAvatarChange]);

  // 处理文件选择
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('请上传 JPG、PNG 或 WebP 格式的图片');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setError(null);
    setShowMenu(false);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上传文件
    await uploadAvatar(file);
  }, [uploadAvatar]);

  // 删除头像
  const handleDeleteAvatar = async () => {
    setShowMenu(false);
    setIsUploading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('请先登录');
        return;
      }

      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      onAvatarChange?.(null);

    } catch (err) {
      console.error('删除头像失败:', err);
      setError(err instanceof Error ? err.message : '删除失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 头像显示 */}
      <div 
        className={`${config.container} rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-indigo-100 to-indigo-200 relative cursor-pointer group`}
        onClick={() => !isUploading && setShowMenu(!showMenu)}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="用户头像"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className={`${config.icon} text-indigo-400`} />
          </div>
        )}

        {/* 上传中遮罩 */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className={`${config.camera} text-white animate-spin`} />
          </div>
        )}

        {/* 悬停遮罩 */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Camera className={`${config.camera} text-white`} />
          </div>
        )}
      </div>

      {/* 相机图标按钮 */}
      <button
        onClick={() => !isUploading && setShowMenu(!showMenu)}
        disabled={isUploading}
        className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>

      {/* 操作菜单 */}
      {showMenu && !isUploading && (
        <>
          {/* 点击外部关闭 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* 菜单 */}
          <div 
            ref={menuRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-xl border border-indigo-100 overflow-hidden z-50 animate-dropdown"
          >
            <button
              onClick={triggerFileSelect}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>上传头像</span>
            </button>
            
            {displayUrl && (
              <button
                onClick={handleDeleteAvatar}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-indigo-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除头像</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 错误提示 */}
      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 hover:text-red-200"
          >
            <X className="w-3 h-3 inline" />
          </button>
        </div>
      )}
    </div>
  );
}
