// 测试Supabase连接和存储桶访问的脚本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 测试Supabase连接
async function testSupabaseConnection() {
  try {
    console.log('测试Supabase连接...');
    
    // 尝试获取存储桶列表
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Supabase连接失败:', error);
      return false;
    }
    
    console.log('✅ Supabase连接成功');
    console.log('存储桶列表:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase连接出错:', error);
    return false;
  }
}

// 测试特定存储桶的访问
async function testBucketAccess(bucketName) {
  try {
    console.log(`\n测试存储桶 ${bucketName} 的访问...`);
    
    // 检查存储桶是否存在
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.error(`❌ 无法访问存储桶 ${bucketName}:`, error);
      return false;
    }
    
    console.log(`✅ 存储桶 ${bucketName} 访问成功`);
    console.log('存储桶信息:', data);
    
    // 尝试列出存储桶中的文件
    const { data: files, error: listError } = await supabase.storage.from(bucketName).list();
    
    if (listError) {
      console.error(`❌ 无法列出存储桶 ${bucketName} 中的文件:`, listError);
      return false;
    }
    
    console.log(`✅ 存储桶 ${bucketName} 文件列表获取成功`);
    console.log('文件列表:', files);
    return true;
  } catch (error) {
    console.error(`❌ 测试存储桶 ${bucketName} 出错:`, error);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试Supabase连接和存储桶访问...\n');
  
  // 1. 测试Supabase连接
  const connected = await testSupabaseConnection();
  
  if (connected) {
    // 2. 测试各个存储桶的访问
    const buckets = ['products-images', 'courses-images', 'avatars', 'courses-videos', 'products-videos'];
    
    for (const bucket of buckets) {
      await testBucketAccess(bucket);
    }
  }
  
  console.log('\n测试完成');
}

// 运行测试
runTests();