// 创建Supabase S3存储桶
const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, BUCKETS } = require('./config/supabase-s3.js');

// 创建S3客户端
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // 重要：Supabase需要这个设置
});

// 检查存储桶是否存在
async function bucketExists(bucketName) {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

// 创建存储桶
async function createBucket(bucketName) {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    
    await s3Client.send(command);
    console.log(`✓ 成功创建存储桶: ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`✗ 创建存储桶 ${bucketName} 失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function setupBuckets() {
  console.log('=== 创建Supabase S3存储桶 ===\n');
  
  // 检查配置
  if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || S3_ACCESS_KEY_ID === '请在此处填入您的Access Key ID') {
    console.error('错误: 请先在 config/supabase-s3.js 中填入有效的S3访问密钥');
    return;
  }
  
  console.log(`S3端点: ${S3_ENDPOINT}`);
  console.log(`S3区域: ${S3_REGION}\n`);
  
  // 为每个存储桶检查是否存在，不存在则创建
  for (const [bucketName, bucketKey] of Object.entries(BUCKETS)) {
    console.log(`处理存储桶: ${bucketKey}`);
    
    const exists = await bucketExists(bucketKey);
    
    if (exists) {
      console.log(`✓ 存储桶 ${bucketKey} 已存在`);
    } else {
      console.log(`- 存储桶 ${bucketKey} 不存在，正在创建...`);
      const created = await createBucket(bucketKey);
      
      if (!created) {
        console.error(`创建存储桶 ${bucketKey} 失败，跳过后续操作`);
        continue;
      }
    }
  }
  
  console.log('\n存储桶设置完成！');
}

// 运行设置
setupBuckets().catch(console.error);