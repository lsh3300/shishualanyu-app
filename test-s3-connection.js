// 测试Supabase S3连接和文件上传功能
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
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

// 测试连接并列出所有存储桶
async function testConnectionAndListBuckets() {
  console.log('测试S3连接...');
  
  try {
    // 测试每个存储桶的访问权限
    for (const [bucketName, bucketKey] of Object.entries(BUCKETS)) {
      console.log(`\n检查存储桶: ${bucketKey}`);
      
      try {
        const command = new ListObjectsV2Command({
          Bucket: bucketKey,
          MaxKeys: 5, // 只获取前5个对象
        });
        
        const response = await s3Client.send(command);
        console.log(`✓ 存储桶 ${bucketKey} 可访问，包含 ${response.Contents ? response.Contents.length : 0} 个对象`);
        
        if (response.Contents && response.Contents.length > 0) {
          console.log('  对象列表:');
          response.Contents.forEach(obj => {
            console.log(`    - ${obj.Key} (${obj.Size} bytes)`);
          });
        }
      } catch (error) {
        console.log(`✗ 存储桶 ${bucketKey} 访问失败: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('连接测试失败:', error.message);
    return false;
  }
  
  return true;
}

// 测试文件上传
async function testFileUpload() {
  console.log('\n测试文件上传...');
  
  // 创建一个测试文件
  const testFilePath = path.join(__dirname, 'test-s3-upload.txt');
  const testContent = `这是一个测试文件，用于验证S3上传功能。\n创建时间: ${new Date().toISOString()}`;
  
  try {
    // 写入测试文件
    fs.writeFileSync(testFilePath, testContent);
    console.log(`✓ 创建测试文件: ${testFilePath}`);
    
    // 上传到products-images存储桶
    const fileName = `test-s3-upload-${Date.now()}.txt`;
    const fileContent = fs.readFileSync(testFilePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKETS.PRODUCTS_IMAGES,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/plain',
    });
    
    const response = await s3Client.send(command);
    console.log(`✓ 文件上传成功: ${fileName}`);
    console.log(`  ETag: ${response.ETag}`);
    console.log(`  存储位置: ${BUCKETS.PRODUCTS_IMAGES}/${fileName}`);
    
    // 验证文件是否可访问
    console.log('\n验证文件访问...');
    const getCommand = new GetObjectCommand({
      Bucket: BUCKETS.PRODUCTS_IMAGES,
      Key: fileName,
    });
    
    const getResponse = await s3Client.send(getCommand);
    const downloadedContent = await streamToString(getResponse.Body);
    
    if (downloadedContent === testContent) {
      console.log('✓ 文件内容验证成功');
    } else {
      console.log('✗ 文件内容验证失败');
    }
    
    // 清理测试文件
    fs.unlinkSync(testFilePath);
    console.log(`✓ 删除本地测试文件: ${testFilePath}`);
    
    // 删除远程测试文件
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKETS.PRODUCTS_IMAGES,
      Key: fileName,
    });
    
    await s3Client.send(deleteCommand);
    console.log(`✓ 删除远程测试文件: ${fileName}`);
    
    return true;
  } catch (error) {
    console.error('文件上传测试失败:', error.message);
    
    // 确保清理本地测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    return false;
  }
}

// 将流转换为字符串
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

// 主测试函数
async function runTests() {
  console.log('=== Supabase S3 连接和文件上传测试 ===\n');
  
  // 检查配置
  if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || S3_ACCESS_KEY_ID === '请在此处填入您的Access Key ID') {
    console.error('错误: 请先在 config/supabase-s3.js 中填入有效的S3访问密钥');
    return;
  }
  
  console.log(`S3端点: ${S3_ENDPOINT}`);
  console.log(`S3区域: ${S3_REGION}`);
  console.log(`Access Key ID: ${S3_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log(`Secret Access Key: ${S3_SECRET_ACCESS_KEY.substring(0, 8)}...\n`);
  
  // 测试连接
  const connectionSuccess = await testConnectionAndListBuckets();
  
  if (!connectionSuccess) {
    console.error('连接测试失败，跳过文件上传测试');
    return;
  }
  
  // 测试文件上传
  const uploadSuccess = await testFileUpload();
  
  if (uploadSuccess) {
    console.log('\n✅ 所有测试通过！S3连接和文件上传功能正常工作。');
  } else {
    console.log('\n❌ 文件上传测试失败，请检查配置和权限。');
  }
}

// 运行测试
runTests().catch(console.error);