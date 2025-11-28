// 测试文件上传功能的脚本
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 创建一个测试图片文件
const testImagePath = path.join(__dirname, 'test-image.jpg');
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(testImagePath, testImageData);

// 测试本地文件上传
async function testLocalUpload() {
  try {
    console.log('测试本地文件上传...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), 'test-image.jpg');
    form.append('type', 'product');
    
    const response = await fetch('http://localhost:3001/api/upload?local=true', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    console.log('本地上传结果:', result);
    
    if (result.success) {
      console.log('✅ 本地文件上传成功');
      return result.file;
    } else {
      console.error('❌ 本地文件上传失败:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 本地上传出错:', error);
    return null;
  }
}

// 测试获取文件列表
async function testFileList(bucket = 'products-images') {
  try {
    console.log(`测试获取文件列表 (${bucket})...`);
    
    const response = await fetch(`http://localhost:3001/api/upload/list?bucket=${bucket}&local=true`, {
      method: 'GET'
    });
    
    const result = await response.json();
    console.log('文件列表结果:', result);
    
    if (result.files) {
      console.log(`✅ 获取文件列表成功，共 ${result.files.length} 个文件`);
      return result.files;
    } else {
      console.error('❌ 获取文件列表失败:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取文件列表出错:', error);
    return null;
  }
}

// 测试文件访问
async function testFileAccess(filePath) {
  try {
    console.log(`测试文件访问 (${filePath})...`);
    
    const response = await fetch(`http://localhost:3001/api/files/local/${filePath}`);
    
    if (response.ok) {
      console.log('✅ 文件访问成功');
      return true;
    } else {
      console.error('❌ 文件访问失败:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ 文件访问出错:', error);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试文件上传功能...\n');
  
  // 1. 测试本地上传
  const uploadedFile = await testLocalUpload();
  
  if (uploadedFile) {
    // 2. 测试获取文件列表
    const files = await testFileList();
    
    if (files && files.length > 0) {
      // 3. 测试文件访问
      const filePath = 'images/products/' + uploadedFile.filename;
      await testFileAccess(filePath);
    }
  }
  
  // 清理测试文件
  try {
    fs.unlinkSync(testImagePath);
    console.log('\n✅ 清理测试文件完成');
  } catch (error) {
    console.error('\n❌ 清理测试文件失败:', error);
  }
  
  console.log('\n测试完成');
}

// 安装必要的依赖
async function installDependencies() {
  const { execSync } = require('child_process');
  try {
    console.log('安装测试依赖...');
    execSync('npm install form-data node-fetch@2', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败:', error);
    process.exit(1);
  }
}

// 检查依赖并运行测试
if (!fs.existsSync('node_modules/form-data') || !fs.existsSync('node_modules/node-fetch')) {
  installDependencies().then(() => runTests());
} else {
  runTests();
}