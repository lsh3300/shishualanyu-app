import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Simple API test...')
    return NextResponse.json(
      { 
        success: true, 
        message: 'API路由正常工作',
        timestamp: new Date().toISOString()
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '未知错误',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}