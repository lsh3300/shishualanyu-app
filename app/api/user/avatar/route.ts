import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '@/lib/supabase/config';

// 创建 Service Client（绕过 RLS）
function createServiceClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!supabaseServiceKey) {
    throw new Error('缺少 SUPABASE_SERVICE_KEY 环境变量');
  }
  return createSupabaseClient(SUPABASE_URL, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// 快速解析 JWT 获取用户 ID
function parseJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.sub || null;
  } catch {
    return null;
  }
}

// 用户认证
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null;
  
  if (!token) {
    return { userId: null, error: 'Missing authorization token' };
  }
  
  // 先尝试快速解析 JWT
  const quickUserId = parseJwtUserId(token);
  if (quickUserId) {
    return { userId: quickUserId, error: null };
  }
  
  // 回退到完整验证
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return { userId: null, error: 'Invalid token' };
  }
  
  return { userId: data.user.id, error: null };
}

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST: 上传头像
export async function POST(request: NextRequest) {
  try {
    // 用户认证
    const { userId, error: authError } = await authenticateUser(request);
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的图片' }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: '不支持的图片格式，请上传 JPG、PNG 或 WebP 格式的图片' 
      }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: '图片大小不能超过 5MB' 
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 生成唯一文件名：用户ID/时间戳-随机数.扩展名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${timestamp}-${random}.${ext}`;

    // 删除用户之前的头像（可选，保持存储桶整洁）
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }
    } catch (e) {
      // 忽略删除旧文件的错误
      console.log('清理旧头像时出错（可忽略）:', e);
    }

    // 上传新头像到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('上传头像失败:', uploadError);
      return NextResponse.json({ 
        error: '上传头像失败，请稍后重试',
        details: uploadError.message 
      }, { status: 500 });
    }

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 更新用户 profiles 表中的 avatar_url
    // 注意：profiles 表可能使用 id 或 user_id 作为主键，尝试两种方式
    let updateError = null;
    
    // 先尝试使用 id 列
    const { error: error1 } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error1) {
      // 如果失败，尝试使用 user_id 列
      const { error: error2 } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error2) {
        // 如果还是失败，尝试插入新记录
        const { error: error3 } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        updateError = error3;
      }
    }

    if (updateError) {
      console.error('更新用户资料失败:', updateError);
      // 即使更新失败，头像已上传成功，返回 URL
    }

    // 同时更新 auth.users 的 user_metadata（可选，用于 OAuth 用户）
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { avatar_url: publicUrl }
      });
    } catch (e) {
      // 忽略 admin API 错误
      console.log('更新 user_metadata 时出错（可忽略）:', e);
    }

    return NextResponse.json({
      success: true,
      message: '头像上传成功',
      avatar_url: publicUrl,
      file_name: fileName
    });

  } catch (error) {
    console.error('头像上传 API 错误:', error);
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE: 删除头像（恢复默认）
export async function DELETE(request: NextRequest) {
  try {
    // 用户认证
    const { userId, error: authError } = await authenticateUser(request);
    if (authError || !userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // 删除用户的所有头像文件
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }
    } catch (e) {
      console.log('删除头像文件时出错:', e);
    }

    // 清空 profiles 表中的 avatar_url
    // 尝试使用 id 或 user_id 列
    const { error: error1 } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error1) {
      // 如果失败，尝试使用 user_id 列
      const { error: error2 } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      
      if (error2) {
        console.error('更新用户资料失败:', error2);
      }
    }

    // 清空 user_metadata 中的 avatar_url
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { avatar_url: null }
      });
    } catch (e) {
      console.log('更新 user_metadata 时出错（可忽略）:', e);
    }

    return NextResponse.json({
      success: true,
      message: '头像已删除'
    });

  } catch (error) {
    console.error('删除头像 API 错误:', error);
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}
