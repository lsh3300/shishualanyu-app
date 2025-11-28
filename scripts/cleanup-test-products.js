#!/usr/bin/env node

/**
 * 删除测试用的材料包和定制服务产品
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function cleanupTestProducts() {
  console.log('🗑️  开始清理测试产品数据...\n');

  try {
    // 1. 获取所有材料包和定制服务产品
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category')
      .in('category', ['材料包', '定制服务']);

    if (fetchError) {
      console.error('❌ 获取产品失败:', fetchError);
      throw fetchError;
    }

    if (!products || products.length === 0) {
      console.log('✅ 没有找到需要删除的产品');
      return;
    }

    console.log(`📋 找到 ${products.length} 个产品需要删除:\n`);
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category})`);
    });

    const productIds = products.map(p => p.id);

    // 2. 删除关联的 product_media 记录
    console.log('\n🖼️  删除产品媒体记录...');
    const { error: mediaError } = await supabase
      .from('product_media')
      .delete()
      .in('product_id', productIds);

    if (mediaError) {
      console.warn('⚠️  删除媒体记录时出现警告:', mediaError.message);
    } else {
      console.log('✅ 成功删除产品媒体记录');
    }

    // 3. 删除产品记录
    console.log('\n📦 删除产品记录...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (deleteError) {
      console.error('❌ 删除产品失败:', deleteError);
      throw deleteError;
    }

    console.log(`✅ 成功删除 ${products.length} 个产品\n`);
    console.log('🎉 清理完成！\n');

  } catch (error) {
    console.error('❌ 发生错误:', error);
    process.exit(1);
  }
}

// 运行脚本
cleanupTestProducts();
