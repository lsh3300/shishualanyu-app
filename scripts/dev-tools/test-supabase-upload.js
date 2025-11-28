// 测试Supabase文件上传功能的脚本
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 创建一个测试图片文件
const testImagePath = path.join(__dirname, 'test-image-supabase.jpg');
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(testImagePath, testImageData);

// 测试Supabase文件上传
async function testSupabaseUpload() {
  try {
    console.log('测试Supabase文件上传...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), 'test-image-supabase.jpg');
    form.append('type', 'product');
    
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    console.log('Supabase上传结果:', result);
    
    if (result.success) {
      console.log('✅ Supabase文件上传成功');
      return result.file;
    } else {
      console.error('❌ Supabase文件上传失败:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Supabase上传出错:', error);
    return null;
  }
}

// 测试获取Supabase文件列表
async function testSupabaseFileList(bucket = 'products-images') {
  try {
    console.log(`测试获取Supabase文件列表 (${bucket})...`);
    
    const response = await fetch(`http://localhost:3001/api/upload/list?bucket=${bucket}`, {
      method: 'GET'
    });
    
    const result = await response.json();
    console.log('Supabase文件列表结果:', result);
    
    if (result.files) {
      console.log(`✅ 获取Supabase文件列表成功，共 ${result.files.length} 个文件`);
      return result.files;
    } else {
      console.error('❌ 获取Supabase文件列表失败:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取Supabase文件列表出错:', error);
    return null;
  }
}

// 测试删除Supabase文件
async function testDeleteSupabaseFile(bucket, filename) {
  try {
    console.log(`测试删除Supabase文件 (${bucket}/${filename})...`);
    
    const response = await fetch(`http://localhost:3001/api/upload?bucket=${bucket}&filename=${filename}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    console.log('Supabase删除结果:', result);
    
    if (result.success) {
      console.log('✅ Supabase文件删除成功');
      return true;
    } else {
      console.error('❌ Supabase文件删除失败:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase删除文件出错:', error);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试Supabase文件上传功能...\n');
  
  // 1. 测试Supabase上传
  const uploadedFile = await testSupabaseUpload();
  
  if (uploadedFile) {
    // 2. 测试获取Supabase文件列表
    const files = await testSupabaseFileList();
    
    if (files && files.length > 0) {
      // 3. 测试删除Supabase文件
      await testDeleteSupabaseFile(uploadedFile.bucket, uploadedFile.filename);
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

// 运行测试
runTests();