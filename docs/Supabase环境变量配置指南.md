# Supabase环境变量配置指南

## 如何获取Supabase凭证

1. 登录到 [Supabase控制台](https://app.supabase.com)
2. 选择您的项目或创建一个新项目
3. 进入项目设置（Settings > API）
4. 复制以下信息：

### 项目URL
- 在"Project URL"部分找到完整的URL
- 格式通常为：`https://your-project-id.supabase.co`
- 将此值替换到`.env.local`文件中的`NEXT_PUBLIC_SUPABASE_URL`

### 匿名密钥(Anon Key)
- 在"Project API keys"部分找到"anon public"密钥
- 这是在客户端使用的公开密钥
- 将此值替换到`.env.local`文件中的`NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 服务端密钥(Service Role Key) - 可选
- 在"Project API keys"部分找到"service_role"密钥
- 这仅在服务端API中使用，请勿在客户端代码中暴露
- 将此值替换到`.env.local`文件中的`SUPABASE_SERVICE_ROLE_KEY`

## 安全注意事项

1. **永远不要**将`.env.local`文件提交到版本控制系统
2. `.gitignore`文件已包含`.env*`模式，确保环境变量文件不会被提交
3. 在生产环境中，请使用平台的环境变量设置功能（如Vercel的环境变量设置）

## 配置完成后

1. 保存`.env.local`文件
2. 重启开发服务器（如果正在运行）
3. 继续执行下一个任务：创建Supabase客户端配置文件