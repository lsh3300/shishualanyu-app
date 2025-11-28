import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_URL } from '@/lib/supabase/config';

// 创建Supabase客户端
const createSupabaseClient = () => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(SUPABASE_URL, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取用户课程数据
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        progress,
        completed_at,
        courses(
          id,
          title,
          description,
          thumbnail_url,
          difficulty_level,
          created_at
        )
      `)
      .eq('user_id', user.id);
    
    if (enrollmentsError) {
      console.error('获取课程数据错误:', enrollmentsError);
      return NextResponse.json({ error: '获取课程数据失败' }, { status: 500 });
    }
    
    // 计算课程统计数据
    const totalCourses = enrollments ? enrollments.length : 0;
    const completedCourses = enrollments ? enrollments.filter(e => e.completed_at !== null).length : 0;
    const inProgressCourses = totalCourses - completedCourses;
    
    // 计算学习天数 - 从第一个课程注册日期开始计算
    let learningDays = 0;
    if (enrollments && enrollments.length > 0) {
      const enrollmentsAny = enrollments as any[];
      const firstEnrollment = enrollmentsAny.reduce((earliest, current) => {
        return new Date(current.created_at) < new Date(earliest.created_at) ? current : earliest;
      });
      
      const firstDate = new Date(firstEnrollment.created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - firstDate.getTime());
      learningDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return NextResponse.json({
      courses: {
        total: totalCourses,
        completed: completedCourses,
        inProgress: inProgressCourses,
        list: enrollments || []
      },
      learningDays
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}