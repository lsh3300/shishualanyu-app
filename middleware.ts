import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 注意：Edge Runtime 不支持 Node.js 文件系统操作
// 本地文件处理应通过 API Routes 实现，而不是 middleware
export async function middleware(request: NextRequest) {
  // Middleware 已禁用本地存储功能
  // 所有文件应通过 Supabase Storage 管理
  return NextResponse.next();
}

export const config = {
  matcher: [],
};