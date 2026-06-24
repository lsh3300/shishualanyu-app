/**
 * 游戏API认证中间件
 * Game API Authentication Middleware
 */

import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { GameConfig } from '../config';
import { AuthError, TestModeError, ForbiddenError } from '../errors';

// ============================================================================
// 类型定义
// ============================================================================

export interface AuthResult {
  /** 用户ID */
  userId: string;
  /** 用户对象（来自Supabase） */
  user: User | null;
  /** 是否为测试模式 */
  isTestMode: boolean;
}

export interface TestModeResult {
  /** 测试用户ID */
  userId: string;
  /** 用户对象为null */
  user: null;
  /** 是否为测试模式 */
  isTestMode: true;
}

// ============================================================================
// 认证函数
// ============================================================================

/**
 * 要求用户认证
 * 
 * @param request - Next.js请求对象
 * @returns 认证结果，包含用户信息
 * @throws AuthError - 用户未登录（仅生产环境）
 * @throws TestModeError - 生产环境尝试使用测试模式
 */
export async function requireAuth(request?: NextRequest): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('认证错误:', error.message);
  }

  // 用户已登录
  if (user) {
    return {
      userId: user.id,
      user,
      isTestMode: false,
    };
  }

  // 用户未登录，检查是否为测试模式
  if (request) {
    const testModeHeader = request.headers.get(GameConfig.testModeHeader);
    
    if (testModeHeader === 'true') {
      // 生产环境不允许测试模式
      if (GameConfig.isProduction) {
        throw new TestModeError();
      }
      
      // 开发环境允许测试模式
      if (GameConfig.allowTestMode) {
        const testUserId = `test-user-${Date.now()}`;
        console.log('🧪 测试模式已启用，测试用户ID:', testUserId);
        
        return {
          userId: testUserId,
          user: null,
          isTestMode: true,
        };
      }
    }
  }

  // 开发环境下，如果未登录，自动启用测试模式（方便开发调试）
  // 使用有效的UUID格式，但标记为测试模式，不会写入数据库
  if (GameConfig.allowTestMode && !GameConfig.isProduction) {
    const testUserId = `test-${Date.now()}`; // 使用非UUID格式，确保不会意外写入数据库
    console.log('🧪 开发环境自动测试模式，测试用户ID:', testUserId);
    
    return {
      userId: testUserId,
      user: null,
      isTestMode: true,
    };
  }

  // 未登录且不是测试模式
  throw new AuthError();
}

/**
 * 可选认证 - 不强制要求登录
 * 
 * @returns 认证结果或null
 */
export async function optionalAuth(): Promise<AuthResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return {
      userId: user.id,
      user,
      isTestMode: false,
    };
  }

  return null;
}

/**
 * 验证用户是否有权限访问指定资源
 * 
 * @param auth - 认证结果
 * @param resourceOwnerId - 资源所有者ID
 * @throws ForbiddenError - 用户无权限
 */
export function requireOwnership(auth: AuthResult, resourceOwnerId: string): void {
  if (auth.userId !== resourceOwnerId) {
    throw new ForbiddenError('您没有权限访问此资源');
  }
}

/**
 * 检查是否为测试模式请求
 * 
 * @param request - Next.js请求对象
 * @returns 是否为测试模式
 */
export function isTestModeRequest(request: NextRequest): boolean {
  if (GameConfig.isProduction) {
    return false;
  }
  
  const testModeHeader = request.headers.get(GameConfig.testModeHeader);
  return testModeHeader === 'true' && GameConfig.allowTestMode;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取Supabase客户端（服务端）
 */
export async function getServerSupabase() {
  return await createClient();
}

/**
 * 从请求中提取Bearer Token
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
