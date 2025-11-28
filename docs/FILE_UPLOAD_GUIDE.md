# 文件上传系统使用指南

本系统支持本地存储和Supabase云存储两种文件上传方式，适用于产品图片、课程资料、用户头像等多种场景。

## 目录结构

```
local-storage/
├── images/
│   ├── products/     # 产品图片
│   ├── courses/      # 课程图片
│   └── avatars/      # 用户头像
├── videos/
│   ├── courses/      # 课程视频
│   └── products/     # 产品视频
└── temp/             # 临时文件
```

## Supabase存储桶

系统创建了以下存储桶：

1. `products-images` - 产品图片（最大5MB）
2. `courses-images` - 课程图片（最大5MB）
3. `avatars` - 用户头像（最大2MB）
4. `courses-videos` - 课程视频（最大100MB）
5. `products-videos` - 产品视频（最大100MB）

## API接口

### 上传文件

**本地存储:**
```
POST /api/upload?local=true
Content-Type: multipart/form-data

Body:
- file: 文件
- destination: 存储目录 (images/products, images/courses, etc.)
```

**Supabase存储:**
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: 文件
- bucket: 存储桶名称 (products-images, courses-images, etc.)
```

### 获取文件列表

**本地存储:**
```
GET /api/upload?local=true&bucket=images/products
```

**Supabase存储:**
```
GET /api/upload/list?bucket=products-images
```

### 删除文件

**本地存储:**
```
DELETE /api/upload?local=true&bucket=images/products&filename=example.jpg
```

**Supabase存储:**
```
DELETE /api/upload?bucket=products-images&filename=example.jpg
```

## 初始化设置

### 1. 设置环境变量

确保`.env.local`文件包含正确的Supabase配置：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### 2. 初始化Supabase存储

运行以下命令创建存储桶和策略：

```bash
node scripts/init-supabase-storage.js
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 使用示例

### 1. 通过Web界面上传

访问 `http://localhost:3000/upload-test.html` 使用测试界面上传文件。

### 2. 通过代码上传

```javascript
// 本地存储
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('destination', 'images/products');

fetch('/api/upload?local=true', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// Supabase存储
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('bucket', 'products-images');

fetch('/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 访问上传的文件

### 本地存储文件

本地存储的文件可以通过以下URL访问：

```
http://localhost:3000/local-storage/images/products/example.jpg
```

### Supabase存储文件

Supabase存储的文件可以通过以下URL访问：

```
https://your-project.supabase.co/storage/v1/object/public/products-images/example.jpg
```

## 文件大小限制

- 产品图片：最大5MB
- 课程图片：最大5MB
- 用户头像：最大2MB
- 课程视频：最大100MB
- 产品视频：最大100MB

## 安全策略

- 本地存储文件只能通过API访问，不能直接访问文件系统
- Supabase存储桶配置了适当的RLS策略，确保用户只能访问自己的文件
- 所有上传的文件都会进行类型验证，防止恶意文件上传

## 故障排除

### 1. 文件上传失败

- 检查文件大小是否超过限制
- 确认文件类型是否被允许
- 检查网络连接和Supabase配置

### 2. 无法访问上传的文件

- 确认中间件配置正确
- 检查文件路径是否正确
- 确认文件是否存在

### 3. Supabase存储桶创建失败

- 检查Supabase服务密钥是否正确
- 确认Supabase项目是否处于活动状态
- 检查存储桶名称是否已存在

## 扩展功能

### 1. 图片压缩

可以在上传API中添加图片压缩功能，减少存储空间占用：

```javascript
const sharp = require('sharp');

// 在上传前压缩图片
const compressedBuffer = await sharp(fileBuffer)
  .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### 2. 文件缩略图

为图片和视频生成缩略图：

```javascript
// 为图片生成缩略图
const thumbnailBuffer = await sharp(fileBuffer)
  .resize(200, 200, { fit: 'cover' })
  .jpeg({ quality: 70 })
  .toBuffer();
```

### 3. CDN集成

可以集成CDN服务，加速文件访问：

```javascript
// 使用Cloudinary或AWS S3作为CDN
const cdnUrl = `https://cdn.example.com/${bucket}/${filename}`;
```

## 维护建议

1. 定期清理临时文件目录
2. 监控存储使用量，避免超出限制
3. 定期备份重要文件
4. 实施文件访问日志记录
5. 定期检查和更新安全策略