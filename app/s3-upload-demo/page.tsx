'use client';

import { useState, useRef } from 'react';

export default function S3UploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('image');
  const [subType, setSubType] = useState<string>('product');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('请选择一个文件');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('subType', subType);

    try {
      const response = await fetch('/api/upload-s3', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult(result);
      } else {
        setError(result.error || '上传失败');
      }
    } catch (err) {
      setError('上传过程中发生错误: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">S3文件上传演示</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择文件
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文件类型
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="image">图片</option>
              <option value="video">视频</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              子类型
            </label>
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="product">产品</option>
              <option value="course">课程</option>
              <option value="avatar">头像</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? '上传中...' : '上传文件'}
          </button>
          
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            重置
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {uploadResult && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <h2 className="text-lg font-semibold mb-2">上传成功！</h2>
          <div className="space-y-1">
            <p><strong>文件名:</strong> {uploadResult.fileName}</p>
            <p><strong>存储桶:</strong> {uploadResult.bucket}</p>
            <p><strong>文件类型:</strong> {uploadResult.fileType}</p>
            <p><strong>子类型:</strong> {uploadResult.subType}</p>
            <p><strong>URL:</strong> 
              <a 
                href={uploadResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                {uploadResult.url}
              </a>
            </p>
          </div>
          
          {uploadResult.fileType === 'image' && (
            <div className="mt-4">
              <p className="mb-2"><strong>预览:</strong></p>
              <img 
                src={uploadResult.url} 
                alt="上传的图片" 
                className="max-w-full h-auto rounded-md border border-gray-300"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}
          
          {uploadResult.fileType === 'video' && (
            <div className="mt-4">
              <p className="mb-2"><strong>预览:</strong></p>
              <video 
                controls 
                className="max-w-full h-auto rounded-md border border-gray-300"
                style={{ maxHeight: '300px' }}
              >
                <source src={uploadResult.url} type="video/mp4" />
                您的浏览器不支持视频播放。
              </video>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">存储桶说明</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>products-images:</strong> 产品图片</li>
          <li><strong>products-videos:</strong> 产品视频</li>
          <li><strong>courses-images:</strong> 课程图片</li>
          <li><strong>courses-videos:</strong> 课程视频</li>
          <li><strong>avatars:</strong> 用户头像</li>
        </ul>
      </div>
    </div>
  );
}