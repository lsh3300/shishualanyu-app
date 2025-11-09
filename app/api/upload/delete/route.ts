import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { path: filePath, isLocal } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: '文件路径不能为空' },
        { status: 400 }
      );
    }

    if (isLocal) {
      // 删除本地文件
      const fullPath = path.join(process.cwd(), 'public', 'local-storage', filePath);
      
      try {
        await unlink(fullPath);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('删除本地文件失败:', error);
        return NextResponse.json(
          { error: '删除文件失败' },
          { status: 500 }
        );
      }
    } else {
      // 删除Supabase文件
      const supabase = createClient();
      
      // 从路径中提取bucket和文件路径
      const pathParts = filePath.split('/');
      const bucket = pathParts[0];
      const file = pathParts.slice(1).join('/');
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([file]);
      
      if (error) {
        console.error('删除Supabase文件失败:', error);
        return NextResponse.json(
          { error: '删除文件失败' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('删除文件请求处理失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}