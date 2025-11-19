# 产品与媒体数据初始化指南

本应用的所有产品信息与图片/视频统一存储在 Supabase 中。请按照以下步骤完成初始化，确保商店、详情、收藏、购物车等界面能够显示一致的内容。

## 1. 配置环境变量

在项目根目录的 `.env.local` 中确保存在以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_PRODUCT_BUCKET=product-media   # 可选，默认为 product-media
```

服务角色密钥仅用于服务端脚本/Route Handler，请勿暴露给客户端。

## 2. 创建数据表

1. 登录 Supabase 控制台，打开项目的 **SQL Editor**。
2. 将 `supabase/products-schema.sql` 的内容粘贴到编辑器运行。
   - 该脚本会创建 `products`、`product_media` 表、相关索引、RLS 策略以及示例数据结构。
   - 若脚本提示对象已存在，可忽略；它是幂等的。

## 3. 创建 Storage Bucket

脚本 `scripts/seed-products.js` 会自动检查 bucket，如果不存在会尝试创建。如果希望手动操作：

1. 在 Supabase 控制台进入 **Storage → Create bucket**。
2. 名称建议使用 `.env.local` 中的 `SUPABASE_PRODUCT_BUCKET`（默认 `product-media`）。
3. 选择 **Public bucket**，以便前端可直接访问图片。

## 4. 执行产品种子脚本

```
npm install
npm run seed:products
```

脚本会：

- 读取 `scripts/seed-products.js` 中的示例产品定义；
- 将 `public/` 目录内的图片上传到 Storage；
- 在 `products` 与 `product_media` 表写入/更新记录。

如需引入真实产品，可复制脚本并替换 `sampleProducts` 数据，或编写新的管理界面。

## 5. 验证

1. 运行 `npm run dev`，访问 `http://localhost:3000/store`、`/store/[id]`、`/profile/favorites` 等页面，确认图片与数据一致。
2. 如果出现 404 或空白图片，请检查：
   - `product_media` 表中是否存在对应记录；
   - Storage 中文件是否上传成功且 bucket 为 public；
   - API `/api/products` 是否返回 `images` 数组与 `coverImage`。

## 6. 后续维护建议

- 新增产品：可通过后台管理页面（后续可实现）或复用脚本逻辑上传并插入数据。
- 更新媒体：删除 `product_media` 中旧记录后重新上传，或在脚本中启用 `upsert`。
- 大量导入：建议准备结构化 JSON/CSV，并编写批量脚本调用 Supabase API。

完成上述配置后，应用的所有产品数据即可统一由 Supabase 管理，确保多处界面共享同一份信息。***

