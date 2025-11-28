# 数据库迁移执行指南 🗄️

## ⚠️ 重要提示

如果你在执行迁移时遇到错误，请使用**修复版本**的迁移文件：

```
📁 supabase/migrations/20251127_user_achievements_fixed.sql
```

---

## 🔧 修复内容

修复版本解决了以下问题：

1. ✅ 添加了 `update_updated_at_column()` 函数定义
2. ✅ 调整了 SQL 执行顺序
3. ✅ 添加了安装完成提示

---

## 📋 执行步骤

### 步骤 1: 打开 Supabase SQL Editor

1. 访问：https://supabase.com/dashboard
2. 选择你的项目
3. 左侧菜单 → **SQL Editor**
4. 点击 **New query**

### 步骤 2: 复制 SQL 内容

打开文件：
```
📁 supabase/migrations/20251127_user_achievements_fixed.sql
```

**复制全部内容** (Ctrl+A → Ctrl+C)

### 步骤 3: 粘贴并执行

1. 在 SQL Editor 中粘贴 (Ctrl+V)
2. 点击右下角绿色的 **Run** 按钮
3. 等待执行完成

### 步骤 4: 验证成功

执行成功后，你应该看到：

```
NOTICE: ✅ 用户成就系统数据库安装完成！
NOTICE: 📊 已创建 4 个表
NOTICE: 🔒 已配置 RLS 安全策略
NOTICE: 📈 已创建 2 个视图和 1 个统计函数
NOTICE: 🎉 系统就绪，可以开始使用！
```

---

## ✅ 验证安装

在 SQL Editor 中运行以下查询验证：

```sql
-- 检查表是否创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('enrollments', 'course_likes', 'course_comments', 'comment_likes');
```

应该返回 **4 行记录**。

---

## 🐛 常见错误处理

### 错误 1: "column status does not exist"
**原因**: 使用了旧版本的迁移文件  
**解决**: 使用 `20251127_user_achievements_fixed.sql`

### 错误 2: "function update_updated_at_column() does not exist"
**原因**: 函数定义顺序问题  
**解决**: 修复版已解决，重新执行即可

### 错误 3: "relation already exists"
**原因**: 表已经创建过  
**解决**: 
```sql
-- 先删除已有的表（谨慎！会丢失数据）
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS course_comments CASCADE;
DROP TABLE IF EXISTS course_likes CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;

-- 然后重新执行迁移
```

---

## 📊 创建的数据库对象

### 表 (4个)
- ✅ `enrollments` - 课程注册表
- ✅ `course_likes` - 课程点赞表
- ✅ `course_comments` - 课程评论表
- ✅ `comment_likes` - 评论点赞表

### 索引 (13个)
- enrollments: 4个索引
- course_likes: 2个索引
- course_comments: 4个索引
- comment_likes: 2个索引
- 其他: 1个触发器索引

### 视图 (2个)
- ✅ `user_learning_stats` - 学习统计
- ✅ `user_engagement_stats` - 互动统计

### 函数 (3个)
- ✅ `update_updated_at_column()` - 更新时间戳
- ✅ `update_comment_likes_count()` - 更新评论点赞数
- ✅ `get_user_achievements()` - 获取用户成就

### RLS 策略 (11个)
- enrollments: 3个策略
- course_likes: 3个策略
- course_comments: 4个策略
- comment_likes: 3个策略

---

## 🎉 下一步

数据库迁移完成后：

1. **重启开发服务器**
   ```powershell
   npm run dev
   ```

2. **测试功能**
   - 访问课程详情页
   - 测试点赞功能
   - 测试评论功能
   - 查看个人主页成就

3. **查看文档**
   - `docs/USER_ACHIEVEMENTS_SYSTEM.md` - 完整系统文档
   - `docs/QUICK_START_ACHIEVEMENTS.md` - 快速开始指南

---

**状态**: ✅ 就绪  
**最后更新**: 2025-11-27
