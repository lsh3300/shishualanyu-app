// 测试登录功能的简单脚本
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTkzNDksImV4cCI6MjA3Nzg3NTM0OX0.JvPDK5VK8hfqSdh0XZr4rvlbrJJhcjUb4Hi33bG7aPI';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 测试登录函数
async function testSignIn() {
  console.log('测试登录功能...');
  
  try {
    // 尝试使用测试账号登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@test.com',
      password: 'password123'
    });
    
    if (error) {
      console.error('登录失败:', error.message);
      return { success: false, error: error.message };
    } else {
      console.log('登录成功:', data);
      return { success: true, data };
    }
  } catch (err) {
    console.error('登录过程中发生错误:', err);
    return { success: false, error: err.message };
  }
}

// 测试注册函数
async function testSignUp() {
  console.log('测试注册功能...');
  
  try {
    // 尝试注册新用户
    const { data, error } = await supabase.auth.signUp({
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      options: {
        data: {
          display_name: '测试用户'
        }
      }
    });
    
    if (error) {
      console.error('注册失败:', error.message);
      return { success: false, error: error.message };
    } else {
      console.log('注册成功:', data);
      return { success: true, data };
    }
  } catch (err) {
    console.error('注册过程中发生错误:', err);
    return { success: false, error: err.message };
  }
}

// 执行测试
async function runTests() {
  console.log('开始测试认证功能...\n');
  
  // 测试登录
  const signInResult = await testSignIn();
  console.log('登录测试结果:', signInResult);
  
  console.log('\n');
  
  // 测试注册
  const signUpResult = await testSignUp();
  console.log('注册测试结果:', signUpResult);
  
  console.log('\n测试完成');
}

// 运行测试
runTests();