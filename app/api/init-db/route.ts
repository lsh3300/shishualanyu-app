export async function POST() {
  const { NextResponse } = await import('next/server')
  return NextResponse.json(
    {
      success: false,
      status: 'deprecated',
      message: '该接口已迁移到 CLI（避免在 API 中写入/初始化数据）。',
      recommended: [
        'npm run cli:init-products',
        'npm run cli:init-products -- --confirm',
        'npm run cli:init-products -- --env=.env.local --confirm',
      ],
    },
    { status: 410 }
  )
}