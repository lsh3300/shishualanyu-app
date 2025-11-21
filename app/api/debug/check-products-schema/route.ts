import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // 获取一个产品样本以查看字段
    const { data: sampleProduct, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      fields: sampleProduct ? Object.keys(sampleProduct) : [],
      sampleProduct
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
