// 测试S3视频上传API
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 创建一个测试视频文件
function createTestVideo() {
  const testVideoPath = path.join(__dirname, 'test-video.mp4');
  
  // 如果测试视频不存在，创建一个简单的MP4文件
  if (!fs.existsSync(testVideoPath)) {
    // 这是一个最小化的MP4文件头，仅用于测试
    const mp4Data = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32, 0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
      0x66, 0x72, 0x65, 0x65, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x64, 0x61, 0x74, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    fs.writeFileSync(testVideoPath, mp4Data);
    console.log('✓ 创建测试视频:', testVideoPath);
  }
  
  return testVideoPath;
}

// 测试视频上传
async function testVideoUpload() {
  console.log('=== 测试S3视频上传API ===\n');
  
  try {
    // 创建测试视频
    const testVideoPath = createTestVideo();
    
    // 创建FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(testVideoPath), 'test-video.mp4');
    form.append('fileType', 'video');
    form.append('subType', 'product');
    
    console.log('发送视频上传请求到 /api/upload-s3...');
    
    // 发送请求
    const response = await fetch('http://localhost:3000/api/upload-s3', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    // 处理响应
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ 视频上传成功!');
      console.log('文件名:', result.fileName);
      console.log('存储桶:', result.bucket);
      console.log('文件类型:', result.fileType);
      console.log('子类型:', result.subType);
      console.log('URL:', result.url);
      
      return true;
    } else {
      console.log('❌ 视频上传失败');
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
  const success = await testVideoUpload();
  
  if (success) {
    console.log('\n🎉 S3视频上传API测试成功！');
  } else {
    console.log('\n💥 S3视频上传API测试失败！');
  }
}

// 运行测试
runTest().catch(console.error);