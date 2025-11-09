import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function middleware(request: NextRequest) {
  // 处理本地存储文件的访问
  if (request.nextUrl.pathname.startsWith('/local-storage/')) {
    try {
      // 将URL路径转换为文件系统路径
      const filePath = request.nextUrl.pathname.replace('/local-storage/', '');
      const actualPath = join(process.cwd(), 'local-storage', filePath);
      
      // 检查文件是否存在
      if (existsSync(actualPath)) {
        // 读取文件内容
        const fileBuffer = await readFile(actualPath);
        
        // 根据文件扩展名设置适当的Content-Type
        const ext = filePath.split('.').pop()?.toLowerCase();
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
        }
        
        // 返回文件内容
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } else {
        // 文件不存在，返回404
        return new NextResponse('File not found', { status: 404 });
      }
    } catch (error) {
      console.error('Error serving local file:', error);
      return new NextResponse('Internal server error', { status: 500 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/local-storage/:path*'],
};