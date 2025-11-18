const { createClient } = require('@supabase/supabase-js');

// Supabase配置 - 与API完全相同
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5OTM0OSwiZXhwIjoyMDc3ODc1MzQ5fQ.xLz4xb4eHzq9i6E40d8vMYzgOloLBuNPJM1tZ4oTzF8';

// 使用与API相同的配置
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testStatsAPI() {
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
  
  try {
    console.log('测试统计API逻辑...');
    
    // 模拟API中的查询逻辑
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', TEST_USER_ID);
    
    console.log('Favorites data:', favoritesData);
    console.log('Favorites error:', favoritesError);
    
    const favoritesCount = favoritesData ? favoritesData.length : 0;
    console.log('Calculated favorites count:', favoritesCount);
    
    // 测试直接调用API
    console.log('\n直接调用API...');
    const response = await fetch('http://localhost:3001/api/user/stats');
    const data = await response.json();
    console.log('API response:', data);
    
  } catch (error) {
    console.error('Error testing stats API:', error);
  }
}

testStatsAPI();