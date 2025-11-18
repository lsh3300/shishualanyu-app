# 修复购物车功能指南

## 问题
购物车API返回500错误，因为cart_items表不存在或缺少外键关系。

## 解决方案
请在Supabase控制台的SQL编辑器中执行以下步骤：

1. 打开Supabase控制台
2. 进入SQL编辑器
3. 执行fix-cart-final.sql文件中的所有SQL命令

## 执行步骤
1. 在Supabase控制台中，点击左侧菜单的"SQL Editor"
2. 点击"New query"
3. 复制fix-cart-final.sql文件中的所有内容
4. 粘贴到SQL编辑器中
5. 点击"Run"执行所有命令

## 验证
执行完成后，可以测试购物车API是否正常工作：
```powershell
cd "c:\Users\lsh\Desktop\世说蓝语app"
Invoke-WebRequest -Uri "http://localhost:3001/api/cart" -Method GET
```

## 注意事项
- 确保在Supabase控制台中执行SQL命令，而不是在本地环境中
- 执行完成后，可能需要等待几分钟让Supabase更新schema缓存
- 如果仍然有问题，请检查Supabase控制台中的表是否已正确创建
- 新的SQL脚本包含了刷新schema缓存的命令，应该能解决缓存问题