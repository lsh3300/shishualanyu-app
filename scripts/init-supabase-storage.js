const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5OTM0OSwiZXhwIjoyMDc3ODc1MzQ5fQ.x8nY1jK0tH2qK7nL8X5mF6p9vJ3rR2sQ4wT5uV7zX8';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 存储桶配置
const buckets = [
  { name: 'products-images', public: true, fileSizeLimit: 5242880 }, // 5MB
  { name: 'courses-images', public: true, fileSizeLimit: 5242880 }, // 5MB
  { name: 'avatars', public: true, fileSizeLimit: 2097152 }, // 2MB
  { name: 'courses-videos', public: true, fileSizeLimit: 104857600 }, // 100MB
  { name: 'products-videos', public: true, fileSizeLimit: 104857600 }, // 100MB
];

// 创建存储桶
async function createBucket(bucket) {
  try {
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      allowedMimeTypes: bucket.name.includes('images') || bucket.name === 'avatars' 
        ? ['image/*'] 
        : bucket.name.includes('videos') 
        ? ['video/*'] 
        : ['*'],
      fileSizeLimit: bucket.fileSizeLimit,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`存储桶 ${bucket.name} 已存在`);
        return true;
      }
      throw error;
    }

    console.log(`存储桶 ${bucket.name} 创建成功`);
    return true;
  } catch (error) {
    console.error(`创建存储桶 ${bucket.name} 失败:`, error);
    return false;
  }
}

// 执行SQL策略文件
async function executePolicies() {
  try {
    const sqlPath = path.join(__dirname, '..', 'supabase', 'storage-buckets.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // 使用Supabase CLI执行SQL
    const { stdout, stderr } = await execAsync(`supabase db push --db-url ${supabaseUrl}`);
    
    if (stderr) {
      console.error('执行SQL策略时出错:', stderr);
      return false;
    }
    
    console.log('SQL策略执行成功');
    return true;
  } catch (error) {
    console.error('执行SQL策略失败:', error);
    return false;
  }
}

// 上传示例文件
async function uploadSampleFiles() {
  const localStoragePath = path.join(__dirname, '..', 'local-storage');
  
  // 检查本地存储目录是否存在
  if (!fs.existsSync(localStoragePath)) {
    console.log('本地存储目录不存在，跳过示例文件上传');
    return true;
  }
  
  const sampleFiles = [
    { bucket: 'products-images', path: 'images/products', pattern: /\.(jpg|jpeg|png|gif|webp)$/i },
    { bucket: 'courses-images', path: 'images/courses', pattern: /\.(jpg|jpeg|png|gif|webp)$/i },
    { bucket: 'avatars', path: 'images/avatars', pattern: /\.(jpg|jpeg|png|gif|webp)$/i },
    { bucket: 'courses-videos', path: 'videos/courses', pattern: /\.(mp4|webm|mov)$/i },
    { bucket: 'products-videos', path: 'videos/products', pattern: /\.(mp4|webm|mov)$/i },
  ];
  
  for (const { bucket, path: dirPath, pattern } of sampleFiles) {
    const fullDirPath = path.join(localStoragePath, dirPath);
    
    if (!fs.existsSync(fullDirPath)) {
      console.log(`目录 ${fullDirPath} 不存在，跳过`);
      continue;
    }
    
    const files = fs.readdirSync(fullDirPath);
    const matchingFiles = files.filter(file => pattern.test(file));
    
    if (matchingFiles.length === 0) {
      console.log(`目录 ${fullDirPath} 中没有匹配的文件`);
      continue;
    }
    
    // 只上传前3个文件作为示例
    const filesToUpload = matchingFiles.slice(0, 3);
    
    for (const file of filesToUpload) {
      const filePath = path.join(fullDirPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(file, fileBuffer, {
            contentType: getContentType(file),
            upsert: true,
          });
          
        if (error) throw error;
        
        console.log(`文件 ${file} 上传到存储桶 ${bucket} 成功`);
      } catch (error) {
        console.error(`上传文件 ${file} 到存储桶 ${bucket} 失败:`, error);
      }
    }
  }
  
  return true;
}

// 获取文件MIME类型
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    default:
      return 'application/octet-stream';
  }
}

// 主函数
async function setupStorage() {
  console.log('开始设置Supabase存储...');
  
  // 创建存储桶
  console.log('\n1. 创建存储桶...');
  let allBucketsCreated = true;
  for (const bucket of buckets) {
    const success = await createBucket(bucket);
    if (!success) {
      allBucketsCreated = false;
    }
  }
  
  if (!allBucketsCreated) {
    console.error('部分存储桶创建失败');
    return false;
  }
  
  // 执行SQL策略
  console.log('\n2. 执行存储策略...');
  const policiesSuccess = await executePolicies();
  if (!policiesSuccess) {
    console.error('存储策略执行失败');
    return false;
  }
  
  // 上传示例文件
  console.log('\n3. 上传示例文件...');
  const uploadSuccess = await uploadSampleFiles();
  if (!uploadSuccess) {
    console.error('示例文件上传失败');
    return false;
  }
  
  console.log('\nSupabase存储设置完成！');
  return true;
}

// 运行设置
setupStorage()
  .then(success => {
    if (success) {
      console.log('存储设置成功完成');
      process.exit(0);
    } else {
      console.error('存储设置失败');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('存储设置过程中发生错误:', error);
    process.exit(1);
  });