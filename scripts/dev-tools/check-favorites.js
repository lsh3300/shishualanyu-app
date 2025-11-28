const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5OTM0OSwiZXhwIjoyMDc3ODc1MzQ5fQ.xLz4xb4eHzq9i6E40d8vMYzgOloLBuNPJM1tZ4oTzF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFavorites() {
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
  
  try {
    // 检查收藏表中的所有数据
    const { data: allFavorites, error: allFavError } = await supabase
      .from('favorites')
      .select('*');
      
    console.log('All favorites in DB:', allFavorites);
    console.log('All favorites error:', allFavError);
    
    // 检查测试用户的收藏数据
    const { data: userFavorites, error: userFavError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', TEST_USER_ID);
      
    console.log('User favorites:', userFavorites);
    console.log('User favorites error:', userFavError);
    
    // 检查收藏数量
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);
      
    console.log('Favorites count:', count);
    console.log('Count error:', countError);
    
    // 检查所有用户的收藏数量
    const { count: allCount, error: allCountError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true });
      
    console.log('All users favorites count:', allCount);
    console.log('All count error:', allCountError);
    
  } catch (error) {
    console.error('Error checking favorites:', error);
  }
}

checkFavorites();