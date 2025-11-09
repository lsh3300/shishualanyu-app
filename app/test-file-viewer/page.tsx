"use client";

import { useState } from 'react';
import { FileViewer } from '@/components/ui/file-viewer';
import { getFileUrl } from '@/lib/supabase-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestFileViewer() {
  const [testPath, setTestPath] = useState<string>('');
  const [bucket, setBucket] = useState<string>('products-images');
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const testCases = [
    { name: '正常图片路径', path: 'test-image.jpg', bucket: 'products-images', isLocal: false },
    { name: '正常视频路径', path: 'test-video.mp4', bucket: 'products-videos', isLocal: false },
    { name: '空路径', path: '', bucket: 'products-images', isLocal: false },
    { name: 'undefined路径', path: '', bucket: 'products-images', isLocal: false },
    { name: '无扩展名路径', path: 'file-without-extension', bucket: 'products-images', isLocal: false },
  ];

  const handleTestCase = (testCase: typeof testCases[0]) => {
    setTestPath(testCase.path);
    setBucket(testCase.bucket);
    setIsLocal(testCase.isLocal);
    setError('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">FileViewer 组件测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>测试用例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testCases.map((testCase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTestCase(testCase)}
                >
                  {testCase.name}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm font-medium">当前测试参数:</p>
              <p className="text-sm">路径: {testPath || '(空)'}</p>
              <p className="text-sm">存储桶: {bucket}</p>
              <p className="text-sm">本地存储: {isLocal ? '是' : '否'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>FileViewer 组件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 border rounded">
              <FileViewer
                path={testPath}
                bucket={bucket}
                isLocal={isLocal}
                getFileUrl={getFileUrl}
                width="100%"
                height="100%"
                fallback={<div className="flex items-center justify-center h-full text-gray-500">测试组件</div>}
                onError={(error) => setError(error.message)}
              />
            </div>
            
            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                错误: {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}