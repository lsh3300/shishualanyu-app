import { createServiceClient } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 暂时跳过认证检查，直接返回模拟数据用于测试
    console.log('API: /api/user/stats called');
    
    // 返回新用户的初始统计数据（全为0）
    const initialData = {
      stats: {
        orders: 0,
        courses: 0,
        favorites: 0,
        learningDays: 0,
        completedCourses: 0
      }
    };
    
    console.log('API: Returning initial data for new user:', JSON.stringify(initialData));
    return NextResponse.json(initialData);
    
  } catch (error) {
    console.error('获取用户统计数据出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}