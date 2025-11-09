// 文件上传API接口
// 用于测试Supabase存储功能

const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();

// Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 配置multer用于处理文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型确定存储目录
    let uploadPath;
    
    if (file.mimetype.startsWith('image/')) {
      if (req.body.type === 'avatar') {
        uploadPath = path.join(__dirname, '../local-storage/images/avatars');
      } else if (req.body.type === 'course') {
        uploadPath = path.join(__dirname, '../local-storage/images/courses');
      } else {
        uploadPath = path.join(__dirname, '../local-storage/images/products');
      }
    } else if (file.mimetype.startsWith('video/')) {
      if (req.body.type === 'course') {
        uploadPath = path.join(__dirname, '../local-storage/videos/courses');
      } else {
        uploadPath = path.join(__dirname, '../local-storage/videos/products');
      }
    } else {
      uploadPath = path.join(__dirname, '../local-storage/temp');
    }
    
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片和视频文件'), false);
    }
  }
});

// 上传文件到本地存储
router.post('/local', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      type: req.body.type || 'product'
    };

    res.status(200).json({
      success: true,
      message: '文件上传成功',
      file: fileInfo
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ error: '文件上传失败', details: error.message });
  }
});

// 上传文件到Supabase存储
router.post('/supabase', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 确定存储桶
    let bucket;
    if (req.file.mimetype.startsWith('image/')) {
      if (req.body.type === 'avatar') {
        bucket = 'avatars';
      } else if (req.body.type === 'course') {
        bucket = 'courses-images';
      } else {
        bucket = 'products-images';
      }
    } else if (req.file.mimetype.startsWith('video/')) {
      if (req.body.type === 'course') {
        bucket = 'courses-videos';
      } else {
        bucket = 'products-videos';
      }
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(req.file.path);

    // 上传到Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(req.file.filename, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(req.file.filename);

    // 删除本地临时文件
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: '文件上传到Supabase成功',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bucket: bucket,
        path: data.path,
        publicUrl: publicUrl
      }
    });
  } catch (error) {
    console.error('Supabase文件上传失败:', error);
    res.status(500).json({ error: 'Supabase文件上传失败', details: error.message });
  }
});

// 获取文件列表
router.get('/list/:bucket', async (req, res) => {
  try {
    const { bucket } = req.params;
    const { folder = '' } = req.query;

    // 验证存储桶名称
    const validBuckets = [
      'products-images', 'courses-images', 'avatars',
      'courses-videos', 'products-videos'
    ];

    if (!validBuckets.includes(bucket)) {
      return res.status(400).json({ error: '无效的存储桶名称' });
    }

    // 列出文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      bucket: bucket,
      files: data
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败', details: error.message });
  }
});

// 删除文件
router.delete('/supabase/:bucket/:filename', async (req, res) => {
  try {
    const { bucket, filename } = req.params;

    // 验证存储桶名称
    const validBuckets = [
      'products-images', 'courses-images', 'avatars',
      'courses-videos', 'products-videos'
    ];

    if (!validBuckets.includes(bucket)) {
      return res.status(400).json({ error: '无效的存储桶名称' });
    }

    // 删除文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: '文件删除成功',
      file: {
        bucket: bucket,
        filename: filename
      }
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ error: '删除文件失败', details: error.message });
  }
});

module.exports = router;