const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://ihsghruaglrolmpnxewt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2docnVhZ2xyb2xtcG54ZXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5OTM0OSwiZXhwIjoyMDc3ODc1MzQ5fQ.xLz4xb4eHzq9i6E40d8vMYzgOloLBuNPJM1tZ4oTzF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRawData() {
  try {
    // 使用原始SQL查询
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT * FROM favorites WHERE user_id = \'12345678-1234-1234-1234-123456789abc\''
    });
    
    console.log('Raw SQL query result:', data);
    console.log('Raw SQL query error:', error);
    
    // 检查表结构
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'favorites\''
    });
    
    console.log('Table structure:', tableInfo);
    console.log('Table structure error:', tableError);
    
  } catch (error) {
    console.error('Error checking raw data:', error);
  }
}

checkRawData();