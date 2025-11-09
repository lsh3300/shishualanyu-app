// 测试所有文件类型的S3上传API
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 创建一个测试图片
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-avatar.png');
  
  if (!fs.existsSync(testImagePath)) {
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✓ 创建测试头像图片:', testImagePath);
  }
  
  return testImagePath;
}

// 创建一个测试视频
function createTestVideo() {
  const testVideoPath = path.join(__dirname, 'test-course-video.mp4');
  
  if (!fs.existsSync(testVideoPath)) {
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

// 测试不同类型的文件上传
async function testFileUpload(fileType, subType, fileName) {
  console.log(`\n=== 测试${fileType}上传 (${subType}) ===`);
  
  try {
    let testFilePath;
    
    if (fileType === 'image') {
      testFilePath = createTestImage();
    } else if (fileType === 'video') {
      testFilePath = createTestVideo();
    } else {
      console.log(`❌ 不支持的文件类型: ${fileType}`);
      return false;
    }
    
    // 创建FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), fileName);
    form.append('fileType', fileType);
    form.append('subType', subType);
    
    console.log(`发送${fileType}上传请求到 /api/upload-s3...`);
    
    // 发送请求
    const response = await fetch('http://localhost:3000/api/upload-s3', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    // 处理响应
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ 上传成功!');
      console.log('文件名:', result.fileName);
      console.log('存储桶:', result.bucket);
      console.log('文件类型:', result.fileType);
      console.log('子类型:', result.subType);
      console.log('URL:', result.url);
      
      return true;
    } else {
      console.log('❌ 上传失败');
      console.log('错误信息:', result.error || '未知错误');
      return false;
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return false;
  }
}

// 主函数
async function runTests() {
  console.log('=== 测试所有文件类型的S3上传API ===\n');
  
  const tests = [
    { fileType: 'image', subType: 'avatar', fileName: 'avatar.png' },
    { fileType: 'image', subType: 'course', fileName: 'course-image.png' },
    { fileType: 'video', subType: 'course', fileName: 'course-video.mp4' }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testFileUpload(test.fileType, test.subType, test.fileName);
    if (success) successCount++;
  }
  
  console.log('\n=== 测试结果 ===');
  console.log(`成功: ${successCount}/${tests.length}`);
  
  if (successCount === tests.length) {
    console.log('🎉 所有S3上传API测试成功！');
  } else {
    console.log('💥 部分S3上传API测试失败！');
  }
}

// 运行测试
runTests().catch(console.error);