// Supabase存储桶初始化脚本
// 运行命令: node scripts/setup-storage.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // 需要service key，不是anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请在.env文件中设置SUPABASE_URL和SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 存储桶配置
const buckets = [
  {
    id: 'products-images',
    name: 'products-images',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'courses-images',
    name: 'courses-images',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'avatars',
    name: 'avatars',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'courses-videos',
    name: 'courses-videos',
    public: true,
    file_size_limit: 104857600, // 100MB
    allowed_mime_types: ['video/mp4', 'video/webm', 'video/quicktime']
  },
  {
    id: 'products-videos',
    name: 'products-videos',
    public: true,
    file_size_limit: 104857600, // 100MB
    allowed_mime_types: ['video/mp4', 'video/webm', 'video/quicktime']
  }
];

// 创建存储桶
async function createBucket(bucket) {
  try {
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`存储桶 "${bucket.name}" 已存在，跳过创建`);
        return { success: true, message: 'Already exists' };
      } else {
        throw error;
      }
    }

    console.log(`✓ 成功创建存储桶: ${bucket.name}`);
    return { success: true, data };
  } catch (error) {
    console.error(`✗ 创建存储桶 "${bucket.name}" 失败:`, error.message);
    return { success: false, error };
  }
}

// 执行SQL策略文件
async function executePolicies() {
  try {
    const sqlPath = path.join(__dirname, '../supabase/storage-buckets.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 将SQL分割成单独的语句
    const statements = sql
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .map(statement => statement.trim());

    console.log('开始执行存储策略...');

    for (const statement of statements) {
      if (statement.startsWith('--') || statement.length === 0) continue;
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        
        if (error) {
          console.error(`执行SQL失败: "${statement.substring(0, 50)}..."`, error.message);
        } else {
          console.log(`✓ 成功执行策略: ${statement.substring(0, 50)}...`);
        }
      } catch (err) {
        console.error(`执行SQL异常: "${statement.substring(0, 50)}..."`, err.message);
      }
    }

    console.log('存储策略执行完成');
  } catch (error) {
    console.error('读取SQL文件失败:', error.message);
  }
}

// 上传示例文件
async function uploadSampleFiles() {
  console.log('开始上传示例文件...');

  // 检查本地存储目录
  const localImagesPath = path.join(__dirname, '../local-storage/images');
  const localVideosPath = path.join(__dirname, '../local-storage/videos');

  // 上传产品图片示例
  try {
    const productImagePath = path.join(localImagesPath, 'products');
    if (fs.existsSync(productImagePath)) {
      const files = fs.readdirSync(productImagePath);
      for (const file of files) {
        if (file === 'readme.txt') continue;
        
        const filePath = path.join(productImagePath, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const { data, error } = await supabase.storage
          .from('products-images')
          .upload(`samples/${file}`, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (error) {
          console.error(`上传产品图片失败 ${file}:`, error.message);
        } else {
          console.log(`✓ 成功上传产品图片: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('上传产品图片示例失败:', error.message);
  }

  // 上传课程图片示例
  try {
    const courseImagePath = path.join(localImagesPath, 'courses');
    if (fs.existsSync(courseImagePath)) {
      const files = fs.readdirSync(courseImagePath);
      for (const file of files) {
        if (file === 'readme.txt') continue;
        
        const filePath = path.join(courseImagePath, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const { data, error } = await supabase.storage
          .from('courses-images')
          .upload(`samples/${file}`, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (error) {
          console.error(`上传课程图片失败 ${file}:`, error.message);
        } else {
          console.log(`✓ 成功上传课程图片: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('上传课程图片示例失败:', error.message);
  }

  // 上传课程视频示例
  try {
    const courseVideoPath = path.join(localVideosPath, 'courses');
    if (fs.existsSync(courseVideoPath)) {
      const files = fs.readdirSync(courseVideoPath);
      for (const file of files) {
        if (file === 'readme.txt') continue;
        
        const filePath = path.join(courseVideoPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const { data, error } = await supabase.storage
          .from('courses-videos')
          .upload(`samples/${file}`, fileBuffer, {
            contentType: 'video/mp4',
            upsert: true
          });
          
        if (error) {
          console.error(`上传课程视频失败 ${file}:`, error.message);
        } else {
          console.log(`✓ 成功上传课程视频: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('上传课程视频示例失败:', error.message);
  }

  // 上传产品视频示例
  try {
    const productVideoPath = path.join(localVideosPath, 'products');
    if (fs.existsSync(productVideoPath)) {
      const files = fs.readdirSync(productVideoPath);
      for (const file of files) {
        if (file === 'readme.txt') continue;
        
        const filePath = path.join(productVideoPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const { data, error } = await supabase.storage
          .from('products-videos')
          .upload(`samples/${file}`, fileBuffer, {
            contentType: 'video/mp4',
            upsert: true
          });
          
        if (error) {
          console.error(`上传产品视频失败 ${file}:`, error.message);
        } else {
          console.log(`✓ 成功上传产品视频: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('上传产品视频示例失败:', error.message);
  }

  console.log('示例文件上传完成');
}

// 主函数
async function main() {
  console.log('开始设置Supabase存储桶和策略...\n');

  // 创建存储桶
  console.log('1. 创建存储桶:');
  for (const bucket of buckets) {
    await createBucket(bucket);
  }

  // 执行策略
  console.log('\n2. 设置存储策略:');
  await executePolicies();

  // 上传示例文件
  console.log('\n3. 上传示例文件:');
  await uploadSampleFiles();

  console.log('\nSupabase存储设置完成!');
  console.log('\n存储桶列表:');
  for (const bucket of buckets) {
    const { data } = supabase.storage.getBucket(bucket.name);
    console.log(`- ${bucket.name}: 公开=${bucket.public}, 大小限制=${bucket.file_size_limit / 1024 / 1024}MB`);
  }
}

// 运行主函数
main().catch(console.error);