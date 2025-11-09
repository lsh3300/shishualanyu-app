# 数据库初始化指南

## 步骤1：登录Supabase控制台

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 使用您的账户登录
3. 选择您的项目

## 步骤2：执行SQL脚本

1. 在左侧导航栏中，点击"SQL Editor"
2. 点击"New query"创建新查询
3. 复制以下SQL代码并粘贴到编辑器中：

```sql
-- 创建products表
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 插入示例数据
INSERT INTO public.products (name, description, price, image_url, category) VALUES
('智能手表', '高端智能手表，支持心率监测和GPS定位', 1299.99, 'https://picsum.photos/seed/smartwatch/400/300.jpg', '电子产品'),
('无线耳机', '降噪蓝牙耳机，续航24小时', 599.99, 'https://picsum.photos/seed/earbuds/400/300.jpg', '电子产品'),
('咖啡机', '全自动咖啡机，支持多种咖啡制作', 2499.99, 'https://picsum.photos/seed/coffee/400/300.jpg', '家用电器'),
('瑜伽垫', '环保材质瑜伽垫，防滑设计', 199.99, 'https://picsum.photos/seed/yoga/400/300.jpg', '运动健身'),
('护肤套装', '天然植物成分护肤套装', 399.99, 'https://picsum.photos/seed/skincare/400/300.jpg', '美容护肤');
```

4. 点击"Run"执行SQL脚本

## 步骤3：验证表创建

1. 在左侧导航栏中，点击"Table Editor"
2. 您应该能看到"products"表
3. 点击表名，您应该能看到5条示例数据

## 步骤4：测试API

执行完SQL脚本后，您可以测试API：

```bash
# 测试连接
curl http://localhost:3000/api/test-connection

# 初始化数据库（如果表已存在，将返回成功消息）
curl -X POST http://localhost:3000/api/init-database
```

## 故障排除

如果遇到问题，请检查：

1. 确保您已正确登录Supabase并选择了正确的项目
2. 确保SQL脚本执行成功，没有错误消息
3. 确保您的环境变量(.env.local)中的Supabase配置正确
4. 确保您的开发服务器正在运行

## 注意事项

- 如果表已存在，SQL脚本可能会报错。在这种情况下，您可能需要先删除现有表：
  ```sql
  DROP TABLE IF EXISTS public.products CASCADE;
  ```
  然后再执行上面的创建脚本