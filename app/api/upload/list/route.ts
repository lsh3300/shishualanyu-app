import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取文件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const local = searchParams.get('local') === 'true';
    
    if (!bucket) {
      return NextResponse.json(
        { error: '缺少存储桶参数' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // 如果是本地文件，从本地存储获取
    if (local) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        // 根据存储桶类型确定本地目录
        let localDir = '';
        switch (bucket) {
          case 'products-images':
            localDir = path.join(process.cwd(), 'local-storage', 'images', 'products');
            break;
          case 'courses-images':
            localDir = path.join(process.cwd(), 'local-storage', 'images', 'courses');
            break;
          case 'products-videos':
            localDir = path.join(process.cwd(), 'local-storage', 'videos', 'products');
            break;
          default:
            localDir = path.join(process.cwd(), 'local-storage', bucket);
        }
        
        // 确保目录存在
        if (!fs.existsSync(localDir)) {
          return NextResponse.json({ files: [] });
        }
        
        // 读取目录中的文件
        const files = fs.readdirSync(localDir, { withFileTypes: true })
          .filter(dirent => dirent.isFile())
          .map(dirent => {
            const filePath = path.join(localDir, dirent.name);
            const stats = fs.statSync(filePath);
            return {
              name: dirent.name,
              path: path.relative(path.join(process.cwd(), 'local-storage'), filePath),
              size: stats.size,
              created_at: stats.birthtime.toISOString(),
              updated_at: stats.mtime.toISOString(),
              isLocal: true
            };
          });
        
        return NextResponse.json({ files });
      } catch (error) {
        console.error('获取本地文件列表失败:', error);
        return NextResponse.json(
          { error: '获取本地文件列表失败' },
          { status: 500 }
        );
      }
    }
    
    // 从Supabase获取文件列表
    const { data, error } = await supabase.storage
      .from(bucket)
      .list();
    
    if (error) {
      console.error('获取文件列表失败:', error);
      return NextResponse.json(
        { error: '获取文件列表失败' },
        { status: 500 }
      );
    }
    
    // 获取每个文件的URL
    const files = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(file.name);
        
        return {
          ...file,
          url: urlData.publicUrl,
          isLocal: false
        };
      })
    );
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}