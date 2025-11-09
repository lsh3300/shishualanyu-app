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