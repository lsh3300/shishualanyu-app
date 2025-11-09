# 本地存储目录结构说明

本目录用于存放本地视频和图片文件，便于管理和上传到Supabase Storage。

## 目录结构

```
local-storage/
├── images/
│   ├── products/    # 产品相关图片
│   ├── courses/     # 课程相关图片
│   └── avatars/     # 用户头像图片
├── videos/
│   ├── courses/     # 课程相关视频
│   └── products/    # 产品相关视频
└── temp/            # 临时文件存放
```

## 使用说明

1. **images/products/** - 存放产品图片，支持格式：jpg, jpeg, png, webp
2. **images/courses/** - 存放课程封面图片，支持格式：jpg, jpeg, png, webp
3. **images/avatars/** - 存放用户头像图片，支持格式：jpg, jpeg, png, webp
4. **videos/courses/** - 存放课程视频文件，支持格式：mp4, webm, mov
5. **videos/products/** - 存放产品展示视频，支持格式：mp4, webm, mov
6. **temp/** - 临时文件存放，上传完成后可删除

## 文件命名建议

- 使用小写字母和连字符，例如：`product-001.jpg`
- 包含日期信息，例如：`course-2023-11-09.mp4`
- 避免使用空格和特殊字符

## 上传流程

1. 将文件放入对应的目录
2. 通过应用上传到Supabase Storage
3. 上传成功后可删除本地临时文件

## 注意事项

- 请确保文件大小符合要求（图片：5MB以内，视频：100MB以内）
- 上传前请检查文件格式是否支持
- temp目录中的文件应定期清理