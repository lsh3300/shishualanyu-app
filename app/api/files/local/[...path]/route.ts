import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

// 本地存储目录
const LOCAL_STORAGE_DIR = join(process.cwd(), 'local-storage');

// 处理本地文件访问请求
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path || [];
    
    if (path.length === 0) {
      return NextResponse.json(
        { error: '缺少文件路径' },
        { status: 400 }
      );
    }
    
    // 构建完整的文件路径
    const filePath = join(LOCAL_STORAGE_DIR, ...path);
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }
    
    // 读取文件内容
    const fileBuffer = readFileSync(filePath);
    
    // 根据文件扩展名设置Content-Type
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'json':
        contentType = 'application/json';
        break;
    }
    
    // 返回文件内容
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存1天
      },
    });
  } catch (error) {
    console.error('访问本地文件失败:', error);
    return NextResponse.json(
      { error: '访问文件失败' },
      { status: 500 }
    );
  }
}