import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 上传文件到Supabase Storage
export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// 获取文件URL
export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// 删除文件
export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export default supabase.storage;