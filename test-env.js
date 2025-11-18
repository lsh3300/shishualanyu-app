require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('测试脚本 - Supabase URL:', supabaseUrl);
console.log('测试脚本 - Supabase Key存在:', !!supabaseKey);
console.log('测试脚本 - Supabase Key前10字符:', supabaseKey ? supabaseKey.substring(0, 10) : 'null');