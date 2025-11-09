# 文件上传脚本

这个脚本可以帮助您将本地文件上传到Supabase Storage。

## 使用方法

1. 确保已安装Node.js和项目依赖
2. 在项目根目录运行以下命令：

```bash
node scripts/upload-to-storage.js [文件类型] [文件路径]
```

### 参数说明

- 文件类型：`products-images`, `courses-images`, `avatars`, `courses-videos`, `products-videos`
- 文件路径：相对于local-storage目录的文件路径

### 示例

```bash
# 上传产品图片
node scripts/upload-to-storage.js products-images images/products/product-001.jpg

# 上传课程视频
node scripts/upload-to-storage.js courses-videos videos/courses/intro.mp4

# 上传用户头像
node scripts/upload-to-storage.js avatars images/avatars/user-001.jpg
```

## 注意事项

1. 上传前请确保文件已放置在local-storage目录下的相应子目录中
2. 文件大小限制：图片5MB，视频100MB
3. 支持的图片格式：jpg, jpeg, png, webp
4. 支持的视频格式：mp4, webm, mov

## 自动化上传

您也可以使用以下命令批量上传整个目录：

```bash
# 上传所有产品图片
node scripts/batch-upload.js products-images

# 上传所有课程视频
node scripts/batch-upload.js courses-videos
```

## 错误处理

如果上传失败，请检查：
1. Supabase配置是否正确
2. 网络连接是否正常
3. 文件路径是否正确
4. 文件大小和格式是否符合要求