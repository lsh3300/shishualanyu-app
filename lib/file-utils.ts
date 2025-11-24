import { createClient } from '@/lib/supabase/client';

// 文件工具类
export class FileUtils {
  // 获取文件扩展名
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop()?.toLowerCase() || '';
    }
    return '';
  }

  // 获取文件名（不含扩展名）
  static getFileNameWithoutExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.slice(0, -1).join('.');
    }
    return filename;
  }

  // 获取文件类型
  static getFileType(filename: string): string {
    const extension = this.getFileExtension(filename);
    
    // 图片类型
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
      return 'image';
    }
    
    // 视频类型
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'wmv', 'flv'].includes(extension)) {
      return 'video';
    }
    
    // 音频类型
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension)) {
      return 'audio';
    }
    
    // 文档类型
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    }
    
    // 压缩文件类型
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive';
    }
    
    return 'other';
  }

  // 获取MIME类型
  static getMimeType(filename: string): string {
    const extension = this.getFileExtension(filename);
    
    const mimeTypes: Record<string, string> = {
      // 图片
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon',
      
      // 视频
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      
      // 音频
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'aac': 'audio/aac',
      'flac': 'audio/flac',
      'm4a': 'audio/mp4',
      
      // 文档
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      
      // 压缩文件
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 验证文件类型
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileType = this.getFileType(file.name);
    return allowedTypes.includes(fileType);
  }

  // 验证文件大小
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  // 生成唯一文件名
  static generateUniqueFileName(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const nameWithoutExtension = this.getFileNameWithoutExtension(originalName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
  }

  // 生成文件缩略图（仅适用于图片）
  static async generateThumbnail(file: File, maxWidth = 200, maxHeight = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('只能为图片文件生成缩略图'));
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 计算缩略图尺寸
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制缩略图
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 转换为base64
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      };
      
      img.onerror = () => {
        reject(new Error('加载图片失败'));
      };
      
      // 创建对象URL并加载图片
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      // 清理对象URL
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
      };
    });
  }

  // 读取文件为base64
  static readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // 读取文件为文本
  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  }

  // 读取文件为ArrayBuffer
  static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as ArrayBuffer;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // 下载文件
  static downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 复制文件到剪贴板（仅适用于文本文件）
  static async copyFileToClipboard(file: File): Promise<void> {
    try {
      if (file.type.startsWith('text/')) {
        const text = await this.readFileAsText(file);
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('只能复制文本文件到剪贴板');
      }
    } catch (error) {
      throw new Error(`复制文件到剪贴板失败: ${error}`);
    }
  }

  // 创建文件对象URL
  static createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  // 释放文件对象URL
  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  // 获取文件路径的最后部分
  static getBaseName(path: string): string {
    return path.split('/').pop() || '';
  }

  // 获取文件路径的目录部分
  static getDirName(path: string): string {
    const parts = path.split('/');
    return parts.slice(0, -1).join('/');
  }

  // 连接路径部分
  static joinPath(...parts: string[]): string {
    return parts
      .map((part, index) => {
        if (index === 0) {
          return part.replace(/\/+$/, '');
        } else {
          return part.replace(/^\/+|\/+$/g, '');
        }
      })
      .filter(part => part !== '')
      .join('/');
  }

  // 规范化路径（移除多余的斜杠等）
  static normalizePath(path: string): string {
    return path.replace(/\/+/g, '/');
  }

  // 检查路径是否为绝对路径
  static isAbsolutePath(path: string): boolean {
    return /^https?:\/\//.test(path) || path.startsWith('/');
  }

  // 获取相对路径
  static getRelativePath(fromPath: string, toPath: string): string {
    const fromParts = fromPath.split('/').filter(part => part !== '');
    const toParts = toPath.split('/').filter(part => part !== '');
    
    // 找到共同的前缀
    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }
    
    // 计算需要返回的层数
    const upCount = fromParts.length - commonLength;
    
    // 构建相对路径
    const relativeParts = Array(upCount).fill('..').concat(toParts.slice(commonLength));
    
    return relativeParts.join('/');
  }

  // 检查文件是否为图片
  static isImageFile(filename: string): boolean {
    return this.getFileType(filename) === 'image';
  }

  // 验证图片文件（检查文件类型和MIME类型）
  static validateImageFile(file: File): boolean {
    // 检查文件名扩展名
    const isImageByName = this.isImageFile(file.name);
    // 检查MIME类型
    const isImageByMime = file.type.startsWith('image/');
    
    return isImageByName && isImageByMime;
  }

  // 验证文件（检查文件大小）
  static validateFile(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }

  // 检查文件是否为视频
  static isVideoFile(filename: string): boolean {
    return this.getFileType(filename) === 'video';
  }

  // 检查文件是否为音频
  static isAudioFile(filename: string): boolean {
    return this.getFileType(filename) === 'audio';
  }

  // 检查文件是否为文档
  static isDocumentFile(filename: string): boolean {
    return this.getFileType(filename) === 'document';
  }

  // 检查文件是否为压缩文件
  static isArchiveFile(filename: string): boolean {
    return this.getFileType(filename) === 'archive';
  }

  // 获取文件图标（基于文件类型）
  static getFileIcon(filename: string): string {
    const fileType = this.getFileType(filename);
    
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      case 'archive':
        return '📦';
      default:
        return '📁';
    }
  }

  // 比较两个文件是否相同
  static async compareFiles(file1: File, file2: File): Promise<boolean> {
    if (file1.size !== file2.size) {
      return false;
    }
    
    const buffer1 = await this.readFileAsArrayBuffer(file1);
    const buffer2 = await this.readFileAsArrayBuffer(file2);
    
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);
    
    for (let i = 0; i < view1.length; i++) {
      if (view1[i] !== view2[i]) {
        return false;
      }
    }
    
    return true;
  }

  // 计算文件哈希值（简单实现）
  static async calculateFileHash(file: File): Promise<string> {
    const buffer = await this.readFileAsArrayBuffer(file);
    const view = new Uint8Array(buffer);
    
    let hash = 0;
    for (let i = 0; i < view.length; i++) {
      hash = ((hash << 5) - hash) + view[i];
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(16);
  }
}