import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { join } from 'path';
import { existsSync } from 'fs';

// 本地存储目录
const LOCAL_STORAGE_DIR = join(process.cwd(), 'local-storage');

// 获取文件的公共URL
async function getPublicUrl(filename: string, bucket: string, supabase: any) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return data.publicUrl;
}

// 获取临时签名URL（适用于私有文件）
async function getSignedUrl(filename: string, bucket: string, supabase: any) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 60 * 60); // 1小时有效期

  if (error) {
    throw new Error(`获取签名URL失败: ${error.message}`);
  }

  return data.signedUrl;
}

// 处理文件URL获取请求
export async function POST(request: NextRequest) {
  try {
    const { path, bucket = 'temp', isLocal = false, signed = false } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { error: '缺少文件路径' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    if (isLocal) {
      // 本地文件处理
      const filePath = join(LOCAL_STORAGE_DIR, bucket, path);
      
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: '文件不存在' },
          { status: 404 }
        );
      }
      
      // 返回本地文件URL
      const fileUrl = `/api/files/local/${bucket}/${path}`;
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        path,
        bucket,
        isLocal
      });
    } else {
      // Supabase文件处理
      let fileUrl;
      
      if (signed) {
        // 获取签名URL（适用于私有文件）
        fileUrl = await getSignedUrl(path, bucket, supabase);
      } else {
        // 获取公共URL（适用于公共文件）
        fileUrl = await getPublicUrl(path, bucket, supabase);
      }
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        path,
        bucket,
        isLocal
      });
    }
  } catch (error) {
    console.error('获取文件URL失败:', error);
    return NextResponse.json(
      { error: '获取文件URL失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 批量获取文件URL
export async function PUT(request: NextRequest) {
  try {
    const { files } = await request.json();
    
    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: '请提供有效的文件列表' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    const results = [];
    
    for (const file of files) {
      const { path, bucket = 'temp', isLocal = false, signed = false } = file;
      
      try {
        if (!path) {
          results.push({
            path,
            success: false,
            error: '缺少文件路径'
          });
          continue;
        }
        
        let fileUrl;
        
        if (isLocal) {
          // 本地文件处理
          const filePath = join(LOCAL_STORAGE_DIR, bucket, path);
          
          if (!existsSync(filePath)) {
            results.push({
              path,
              success: false,
              error: '文件不存在'
            });
            continue;
          }
          
          // 返回本地文件URL
          fileUrl = `/api/files/local/${bucket}/${path}`;
        } else {
          // Supabase文件处理
          if (signed) {
            // 获取签名URL（适用于私有文件）
            fileUrl = await getSignedUrl(path, bucket, supabase);
          } else {
            // 获取公共URL（适用于公共文件）
            fileUrl = await getPublicUrl(path, bucket, supabase);
          }
        }
        
        results.push({
          path,
          success: true,
          url: fileUrl,
          bucket,
          isLocal
        });
      } catch (error) {
        console.error(`获取文件URL失败: ${path}`, error);
        results.push({
          path,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('批量获取文件URL失败:', error);
    return NextResponse.json(
      { error: '批量获取文件URL失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}