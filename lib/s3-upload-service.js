// 使用S3协议上传文件到Supabase存储
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, BUCKETS } = require('../config/supabase-s3.js');
const crypto = require('crypto');

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

// 生成唯一文件名
function generateUniqueFileName(originalName, folder = '') {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  const uniqueName = `${baseName}-${timestamp}-${randomString}.${extension}`;
  return folder ? `${folder}/${uniqueName}` : uniqueName;
}

// 上传文件到指定存储桶
async function uploadFileToBucket(fileBuffer, fileName, contentType, bucketName) {
  try {
    // 生成唯一文件名
    const uniqueFileName = generateUniqueFileName(fileName);
    
    // 上传文件
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: contentType,
    });
    
    const response = await s3Client.send(command);
    
    return {
      success: true,
      fileName: uniqueFileName,
      etag: response.ETag,
      url: `${S3_ENDPOINT}/${bucketName}/${uniqueFileName}`
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 从存储桶获取文件
async function getFileFromBucket(fileName, bucketName) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    
    const response = await s3Client.send(command);
    return {
      success: true,
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength
    };
  } catch (error) {
    console.error('获取文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 从存储桶删除文件
async function deleteFileFromBucket(fileName, bucketName) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    
    await s3Client.send(command);
    return {
      success: true
    };
  } catch (error) {
    console.error('删除文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 根据文件类型确定存储桶
function getBucketForFileType(fileType, subType = '') {
  switch (fileType) {
    case 'image':
      if (subType === 'avatar') return BUCKETS.AVATARS;
      if (subType === 'course') return BUCKETS.COURSES_IMAGES;
      return BUCKETS.PRODUCTS_IMAGES;
      
    case 'video':
      if (subType === 'course') return BUCKETS.COURSES_VIDEOS;
      return BUCKETS.PRODUCTS_VIDEOS;
      
    default:
      return BUCKETS.PRODUCTS_IMAGES; // 默认存储桶
  }
}

module.exports = {
  uploadFileToBucket,
  getFileFromBucket,
  deleteFileFromBucket,
  getBucketForBucketType: (bucketType) => BUCKETS[bucketType.toUpperCase()],
  getBucketForFileType,
  generateUniqueFileName
};