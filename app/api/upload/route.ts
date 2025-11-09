// Next.js API路由 - 文件上传
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Supabase客户端
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// 确定存储桶
function getBucket(mimetype: string, type: string) {
  if (mimetype.startsWith('image/')) {
    if (type === 'avatar') {
      return 'avatars';
    } else if (type === 'course') {
      return 'courses-images';
    } else {
      return 'products-images';
    }
  } else if (mimetype.startsWith('video/')) {
    if (type === 'course') {
      return 'courses-videos';
    } else {
      return 'products-videos';
    }
  }
  return null;
}

// 上传到本地存储
async function uploadToLocal(file: File, type: string) {
  try {
    // 确定存储目录
    let uploadDir;
    if (file.type.startsWith('image/')) {
      if (type === 'avatar') {
        uploadDir = join(process.cwd(), 'local-storage/images/avatars');
      } else if (type === 'course') {
        uploadDir = join(process.cwd(), 'local-storage/images/courses');
      } else {
        uploadDir = join(process.cwd(), 'local-storage/images/products');
      }
    } else if (file.type.startsWith('video/')) {
      if (type === 'course') {
        uploadDir = join(process.cwd(), 'local-storage/videos/courses');
      } else {
        uploadDir = join(process.cwd(), 'local-storage/videos/products');
      }
    } else {
      uploadDir = join(process.cwd(), 'local-storage/temp');
    }

    // 确保目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = file.name.split('.').pop();
    const filename = `${file.name}-${timestamp}-${random}.${ext}`;

    // 将文件写入磁盘
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return {
      filename: filename,
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      path: filePath,
      type: type
    };
  } catch (error) {
    throw error;
  }
}

// 上传到Supabase存储
async function uploadToSupabase(file: File, type: string) {
  try {
    // 确定存储桶
    const bucket = getBucket(file.type, type);
    if (!bucket) {
      throw new Error('不支持的文件类型');
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = file.name.split('.').pop();
    const filename = `${file.name}-${timestamp}-${random}.${ext}`;

    // 上传到Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return {
      filename: filename,
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      bucket: bucket,
      path: data.path,
      publicUrl: publicUrl
    };
  } catch (error) {
    throw error;
  }
}

// 获取本地文件列表
async function getLocalFiles(bucket: string) {
  try {
    let dirPath;
    switch (bucket) {
      case 'avatars':
        dirPath = join(process.cwd(), 'local-storage/images/avatars');
        break;
      case 'courses-images':
        dirPath = join(process.cwd(), 'local-storage/images/courses');
        break;
      case 'products-images':
        dirPath = join(process.cwd(), 'local-storage/images/products');
        break;
      case 'courses-videos':
        dirPath = join(process.cwd(), 'local-storage/videos/courses');
        break;
      case 'products-videos':
        dirPath = join(process.cwd(), 'local-storage/videos/products');
        break;
      default:
        throw new Error('无效的存储桶名称');
    }

    if (!existsSync(dirPath)) {
      return [];
    }

    const files = await readdir(dirPath);
    return files.map(name => ({
      name: name,
      id: name,
      created_at: new Date().toISOString(),
      size: 0
    }));
  } catch (error) {
    throw error;
  }
}

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isLocal = searchParams.get('local') === 'true';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'product';

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    let fileInfo;
    if (isLocal) {
      fileInfo = await uploadToLocal(file, type);
      return NextResponse.json({
        success: true,
        message: '文件上传到本地成功',
        file: fileInfo
      });
    } else {
      fileInfo = await uploadToSupabase(file, type);
      return NextResponse.json({
        success: true,
        message: '文件上传到Supabase成功',
        file: fileInfo
      });
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ 
      error: '文件上传失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// 获取文件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const isLocal = searchParams.get('local') === 'true';

    // 验证存储桶名称
    const validBuckets = [
      'products-images', 'courses-images', 'avatars',
      'courses-videos', 'products-videos'
    ];

    if (!bucket || !validBuckets.includes(bucket)) {
      return NextResponse.json({ error: '无效的存储桶名称' }, { status: 400 });
    }

    let files;
    if (isLocal) {
      files = await getLocalFiles(bucket);
    } else {
      // 列出Supabase文件
      const { data, error } = await supabase.storage
        .from(bucket)
        .list();

      if (error) {
        throw error;
      }
      files = data;
    }

    return NextResponse.json({
      success: true,
      bucket: bucket,
      files: files
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json({ 
      error: '获取文件列表失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// 删除文件
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const filename = searchParams.get('filename');

    // 验证存储桶名称
    const validBuckets = [
      'products-images', 'courses-images', 'avatars',
      'courses-videos', 'products-videos'
    ];

    if (!bucket || !validBuckets.includes(bucket)) {
      return NextResponse.json({ error: '无效的存储桶名称' }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: '文件名不能为空' }, { status: 400 });
    }

    // 删除Supabase文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '文件删除成功',
      file: {
        bucket: bucket,
        filename: filename
      }
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json({ 
      error: '删除文件失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}