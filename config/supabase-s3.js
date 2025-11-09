// Supabase S3 Configuration
// 请从Supabase控制台的Storage > S3页面获取以下信息并填入

// S3端点 (从Supabase控制台复制)
const S3_ENDPOINT = 'https://ihsghruaglrolmpnxewt.storage.supabase.co/storage/v1/s3';

// 区域 (从Supabase控制台复制)
const S3_REGION = 'us-east-2';

// 访问密钥 (需要在Supabase控制台创建新的访问密钥)
const S3_ACCESS_KEY_ID = 'd4f6a5eaa13a7ca1f2c772cdca234cdc';
const S3_SECRET_ACCESS_KEY = '7725239d2bbae5a9901f776a595fc4312e082b6f4643ef3235f236f742325c9a';

// 存储桶名称
const BUCKETS = {
  PRODUCTS_IMAGES: 'products-images',
  COURSES_IMAGES: 'courses-images',
  AVATARS: 'avatars',
  COURSES_VIDEOS: 'courses-videos',
  PRODUCTS_VIDEOS: 'products-videos'
};

module.exports = {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  BUCKETS
};