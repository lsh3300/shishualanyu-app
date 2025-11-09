#!/bin/bash

# 世说蓝语app部署脚本
echo "开始部署世说蓝语app到Vercel..."

# 检查是否已安装Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录Vercel
if ! vercel whoami &> /dev/null; then
    echo "请登录Vercel账户..."
    vercel login
fi

# 部署到Vercel
echo "正在部署到Vercel..."
vercel --prod

echo "部署完成！"
echo "请确保在Vercel控制台中设置了以下环境变量："
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"