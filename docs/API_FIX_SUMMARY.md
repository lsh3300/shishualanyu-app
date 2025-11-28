# API 认证修复总结 🔧

## 🐛 问题描述

用户反馈即使已登录，API仍然返回 401 未登录错误，点赞和评论功能无法正常工作。

## 🔍 根本原因

**服务端 Supabase 客户端没有正确处理 cookies**

原来的 `lib/supabase/server.ts` 使用了错误的方式创建客户端：
- ❌ 使用 `createClient` from `@supabase/supabase-js` 
- ❌ 没有读取 cookies
- ❌ 无法获取登录用户会话

## ✅ 修复方案

### 1. 修复 `lib/supabase/server.ts`

**修复前**:
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

**修复后**:
```typescript
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createSupabaseServerClient(
    url,
    anonKey,  // ✅ 使用 anon key，不是 service key
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()  // ✅ 读取 cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// 新增：服务端客户端（绕过RLS）
export function createServiceClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### 2. 修复所有 API 路由的导入

**修复前**:
```typescript
import { createServiceClient } from '@/lib/supabaseClient'  // ❌ 错误路径
import { createClient } from '@/lib/supabase/server'
```

**修复后**:
```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'  // ✅ 统一从这里导入
```

**受影响的文件**:
- ✅ `app/api/courses/[id]/like/route.ts`
- ✅ `app/api/courses/[id]/enroll/route.ts`
- ✅ `app/api/courses/[id]/comments/route.ts`
- ✅ `app/api/user/achievements/route.ts`

## 🔑 关键变化

### createClient (获取当前登录用户)
- ✅ 使用 `@supabase/ssr`
- ✅ 读取 cookies 获取会话
- ✅ 使用 ANON_KEY
- ✅ 尊重 RLS 策略
- ✅ 用于检查用户身份

### createServiceClient (管理员操作)
- ✅ 使用 `@supabase/supabase-js`
- ✅ 使用 SERVICE_KEY
- ✅ 绕过 RLS 策略
- ✅ 用于数据库操作

## 📝 API 使用模式

```typescript
export async function POST(request: NextRequest) {
  // 1. 获取当前登录用户
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  // 2. 使用 service client 操作数据库
  const serviceSupabase = createServiceClient()
  await serviceSupabase.from('table').insert({
    user_id: user.id,  // ✅ 使用从 cookies 获取的 user.id
    ...data
  })
}
```

## 🧪 验证步骤

### 1. 重启服务器
```powershell
# 停止服务器 (Ctrl+C)
npm run dev
```

### 2. 测试登录状态
```javascript
// 在浏览器控制台
fetch('/api/user/achievements')
  .then(r => r.json())
  .then(console.log)

// 应该返回成就数据，而不是 {error: '未登录'}
```

### 3. 测试点赞功能
1. 访问课程详情页
2. 点击"点赞"按钮
3. 应该看到"点赞成功"
4. 刷新页面，点赞状态应该保持

### 4. 测试评论功能
1. 输入评论内容
2. 点击"发表评论"
3. 评论应该出现在列表中
4. 刷新页面，评论应该还在

## ✅ 预期结果

### API 响应变化

**修复前**:
```json
{
  "error": "未登录"
}
```

**修复后**:
```json
{
  "user_id": "uuid",
  "completed_courses": 0,
  "learning_days": 0,
  "total_likes": 1,
  "total_comments": 0
}
```

## 🔒 安全说明

### 为什么需要两个客户端？

1. **createClient** (用户客户端)
   - 使用 ANON_KEY
   - 受 RLS 保护
   - 只能访问用户自己的数据
   - 用于身份验证

2. **createServiceClient** (服务端客户端)
   - 使用 SERVICE_KEY
   - 绕过 RLS
   - 可以访问所有数据
   - 仅在服务端使用，绝不暴露给客户端

## 📊 修复文件清单

- ✅ `lib/supabase/server.ts` - 核心修复
- ✅ `app/api/courses/[id]/like/route.ts`
- ✅ `app/api/courses/[id]/enroll/route.ts`
- ✅ `app/api/courses/[id]/comments/route.ts`
- ✅ `app/api/user/achievements/route.ts`

## 🎉 修复完成

所有 API 现在应该能够：
- ✅ 正确识别登录用户
- ✅ 保存点赞数据
- ✅ 保存评论数据
- ✅ 返回正确的成就数据
- ✅ 刷新后数据持久化

---

**修复时间**: 2025-11-27  
**影响范围**: 所有需要用户认证的 API  
**状态**: ✅ 完成
