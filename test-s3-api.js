// 测试S3上传API
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 创建一个测试图片
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // 如果测试图片不存在，创建一个简单的1x1像素PNG
  if (!fs.existsSync(testImagePath)) {
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // Width: 1, Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), etc.
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk start
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Image data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✓ 创建测试图片:', testImagePath);
  }
  
  return testImagePath;
}

// 测试图片上传
async function testImageUpload() {
  console.log('=== 测试S3图片上传API ===\n');
  
  try {
    // 创建测试图片
    const testImagePath = createTestImage();
    
    // 创建FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), 'test-image.png');
    form.append('fileType', 'image');
    form.append('subType', 'product');
    
    console.log('发送上传请求到 /api/upload-s3...');
    
    // 发送请求
    const response = await fetch('http://localhost:3000/api/upload-s3', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    // 处理响应
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ 图片上传成功!');
      console.log('文件名:', result.fileName);
      console.log('存储桶:', result.bucket);
      console.log('文件类型:', result.fileType);
      console.log('子类型:', result.subType);
      console.log('URL:', result.url);
      
      return true;
    } else {
      console.log('❌ 图片上传失败');
      console.log('错误信息:', result.error || '未知错误');
      return false;
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return false;
  }
}

// 主函数
async function runTest() {
  const success = await testImageUpload();
  
  if (success) {
    console.log('\n🎉 S3上传API测试成功！');
  } else {
    console.log('\n💥 S3上传API测试失败！');
    
    // 检查开发服务器是否运行
    console.log('\n请确保开发服务器正在运行: npm run dev');
  }
}

// 运行测试
runTest().catch(console.error);