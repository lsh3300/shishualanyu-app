'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFileCache } from '@/hooks/use-file-cache';
import { FileViewer } from '@/components/ui/file-viewer';
import { FileUpload } from '@/components/ui/file-upload';
import { FileManager } from '@/components/ui/file-manager';
import { FileSelector, MultiFileSelector } from '@/components/ui/file-selector';
import { FilePreview } from '@/components/ui/file-preview';
import { fileCacheService } from '@/lib/file-cache';
import { FileUtils } from '@/lib/file-utils';

export default function FileCacheTestPage() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [testFileUrl, setTestFileUrl] = useState('');
  const [testBucket, setTestBucket] = useState('temp');
  const [testIsLocal, setTestIsLocal] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const {
    getFileUrl,
    preloadFile,
    clearCache,
    getCacheStats,
    isCached,
    getCachedFile
  } = useFileCache();
  
  // 获取缓存统计信息
  useEffect(() => {
    const fetchCacheStats = async () => {
      try {
        const stats = await getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('获取缓存统计失败:', error);
      }
    };
    
    fetchCacheStats();
  }, [getCacheStats]);
  
  // 添加测试结果
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };
  
  // 测试文件URL获取
  const handleTestGetFileUrl = async () => {
    if (!testFileUrl) {
      addTestResult('错误: 请输入文件路径');
      return;
    }
    
    try {
      addTestResult(`开始获取文件URL: ${testFileUrl}`);
      const url = await getFileUrl(testFileUrl, testBucket, testIsLocal);
      addTestResult(`成功获取文件URL: ${url}`);
      setTestFileUrl(url);
    } catch (error) {
      addTestResult(`获取文件URL失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 测试文件预加载
  const handleTestPreloadFile = async () => {
    if (!testFileUrl) {
      addTestResult('错误: 请输入文件路径');
      return;
    }
    
    try {
      addTestResult(`开始预加载文件: ${testFileUrl}`);
      await preloadFile(testFileUrl, testBucket, testIsLocal);
      addTestResult(`成功预加载文件: ${testFileUrl}`);
      
      // 更新缓存统计
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      addTestResult(`预加载文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 测试缓存检查
  const handleTestIsCached = async () => {
    if (!testFileUrl) {
      addTestResult('错误: 请输入文件路径');
      return;
    }
    
    try {
      const cached = await isCached(testFileUrl, testBucket, testIsLocal);
      addTestResult(`文件缓存状态: ${cached ? '已缓存' : '未缓存'}`);
      
      if (cached) {
        const cachedFile = await getCachedFile(testFileUrl, testBucket, testIsLocal);
        addTestResult(`缓存文件信息: ${JSON.stringify(cachedFile, null, 2)}`);
      }
    } catch (error) {
      addTestResult(`检查缓存状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 测试清理缓存
  const handleTestClearCache = async () => {
    try {
      addTestResult('开始清理缓存');
      await clearCache();
      addTestResult('成功清理缓存');
      
      // 更新缓存统计
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      addTestResult(`清理缓存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 测试文件工具
  const handleTestFileUtils = () => {
    addTestResult('测试文件工具函数');
    
    // 测试获取文件扩展名
    const extension = FileUtils.getFileExtension('test.jpg');
    addTestResult(`文件扩展名: ${extension}`);
    
    // 测试获取文件类型
    const fileType = FileUtils.getFileType('test.jpg');
    addTestResult(`文件类型: ${fileType}`);
    
    // 测试获取MIME类型
    const mimeType = FileUtils.getMimeType('test.jpg');
    addTestResult(`MIME类型: ${mimeType}`);
    
    // 测试格式化文件大小
    const formattedSize = FileUtils.formatFileSize(1024 * 1024 * 5.3);
    addTestResult(`格式化文件大小: ${formattedSize}`);
    
    // 测试验证文件类型
    const isValidImage = FileUtils.isValidFileType('test.jpg', ['image']);
    addTestResult(`验证图片文件类型: ${isValidImage}`);
    
    // 测试生成唯一文件名
    const uniqueFilename = FileUtils.generateUniqueFilename('test.jpg');
    addTestResult(`唯一文件名: ${uniqueFilename}`);
  };
  
  // 测试文件缓存服务
  const handleTestFileCacheService = async () => {
    addTestResult('测试文件缓存服务');
    
    try {
      // 测试设置缓存
      await fileCacheService.setCache('test-key', 'test-data', false);
      addTestResult('成功设置缓存');
      
      // 测试获取缓存
      const cachedData = await fileCacheService.getCache('test-key');
      addTestResult(`获取缓存数据: ${JSON.stringify(cachedData)}`);
      
      // 测试删除缓存
      fileCacheService.deleteCache('test-key');
      addTestResult('成功删除缓存');
      
      // 测试清理过期缓存
      fileCacheService.cleanExpiredCache();
      addTestResult('成功清理过期缓存');
    } catch (error) {
      addTestResult(`文件缓存服务测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">文件缓存测试</h1>
        <Badge variant="outline">
          {cacheStats ? `${cacheStats.count} 个缓存项 (${FileUtils.formatFileSize(cacheStats.size)})` : '加载中...'}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="viewer">文件查看器</TabsTrigger>
          <TabsTrigger value="upload">文件上传</TabsTrigger>
          <TabsTrigger value="manager">文件管理器</TabsTrigger>
          <TabsTrigger value="selector">文件选择器</TabsTrigger>
          <TabsTrigger value="tools">缓存工具</TabsTrigger>
        </TabsList>
        
        <TabsContent value="viewer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文件查看器测试</CardTitle>
              <CardDescription>测试文件查看和缓存功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file-path">文件路径</Label>
                  <Input
                    id="file-path"
                    value={testFileUrl}
                    onChange={(e) => setTestFileUrl(e.target.value)}
                    placeholder="输入文件路径或URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bucket">存储桶</Label>
                  <Select value={testBucket} onValueChange={setTestBucket}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择存储桶" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatars">头像</SelectItem>
                      <SelectItem value="courses">课程</SelectItem>
                      <SelectItem value="products">产品</SelectItem>
                      <SelectItem value="temp">临时</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-local"
                  checked={testIsLocal}
                  onChange={(e) => setTestIsLocal(e.target.checked)}
                />
                <Label htmlFor="is-local">本地存储</Label>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTestGetFileUrl}>获取文件URL</Button>
                <Button onClick={handleTestPreloadFile} variant="outline">预加载文件</Button>
                <Button onClick={handleTestIsCached} variant="outline">检查缓存状态</Button>
                <Button onClick={handleTestClearCache} variant="destructive">清理缓存</Button>
              </div>
              
              {testFileUrl && (
                <div className="mt-4">
                  <FileViewer
                    src={testFileUrl}
                    alt="测试文件"
                    className="max-w-full max-h-96 mx-auto"
                    bucket={testBucket}
                    isLocal={testIsLocal}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文件上传测试</CardTitle>
              <CardDescription>测试文件上传功能</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                bucket={testBucket}
                isLocal={testIsLocal}
                onUploadComplete={(files: any[]) => {
                  addTestResult(`成功上传 ${files.length} 个文件`);
                }}
                onUploadError={(error: Error) => {
                  addTestResult(`上传失败: ${error.message}`);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manager" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文件管理器测试</CardTitle>
              <CardDescription>测试文件管理功能</CardDescription>
            </CardHeader>
            <CardContent>
              <FileManager
                bucket={testBucket}
                isLocal={testIsLocal}
                selectable
                onFileSelect={(file: any) => {
                  setSelectedFiles((prev) => {
                    const path = file?.path as string;
                    if (!path) return prev;
                    return prev.includes(path)
                      ? prev.filter((p) => p !== path)
                      : [...prev, path];
                  });
                  if (file?.name) {
                    addTestResult(`点击文件: ${file.name}`);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="selector" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文件选择器测试</CardTitle>
              <CardDescription>测试文件选择功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>单文件选择器</Label>
                <FileSelector
                  bucket={testBucket}
                  isLocal={testIsLocal}
                  onChange={(path: string) => {
                    if (path) {
                      addTestResult(`选择文件: ${path}`);
                    } else {
                      addTestResult('已清除文件选择');
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>多文件选择器</Label>
                <MultiFileSelector
                  bucket={testBucket}
                  isLocal={testIsLocal}
                  onChange={(paths: string[]) => {
                    addTestResult(`选择 ${paths.length} 个文件`);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>缓存工具测试</CardTitle>
              <CardDescription>测试缓存工具和文件工具</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTestFileUtils}>测试文件工具</Button>
                <Button onClick={handleTestFileCacheService} variant="outline">测试缓存服务</Button>
              </div>
              
              {cacheStats && (
                <div className="space-y-2">
                  <Label>缓存统计</Label>
                  <div className="p-4 bg-gray-100 rounded-md">
                    <pre>{JSON.stringify(cacheStats, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>测试结果</Label>
                <Textarea
                  value={testResults.join('\n')}
                  readOnly
                  className="h-64"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>文件预览</CardTitle>
          <CardDescription>测试文件预览功能</CardDescription>
        </CardHeader>
        <CardContent>
          {testFileUrl && (
            <FilePreview
              file={{
                name: testFileUrl.split('/').pop() || 'test-file',
                path: testFileUrl,
                type:
                  FileUtils.getFileType(testFileUrl) === 'image'
                    ? 'image/*'
                    : FileUtils.getFileType(testFileUrl) === 'video'
                    ? 'video/*'
                    : 'application/octet-stream',
                url: testFileUrl,
                isLocal: testIsLocal,
              }}
              open={!!testFileUrl}
              onClose={() => setTestFileUrl('')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}