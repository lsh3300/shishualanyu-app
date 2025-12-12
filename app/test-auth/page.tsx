'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [apiResult, setApiResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const testInventoryAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory')
      const result = await response.json()
      setApiResult(result)
    } catch (error: any) {
      setApiResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testScoreAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/game/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloth_id: 'test-cloth-' + Date.now(),
          layers: [
            { type: 'base', color: '#4169E1', pattern: 'solid' }
          ]
        })
      })
      const result = await response.json()
      setApiResult(result)
    } catch (error: any) {
      setApiResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔧 认证测试页面</h1>

        {/* 用户状态 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">用户状态</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ 已登录</p>
              <p className="text-sm text-gray-600">用户ID: {user.id}</p>
              <p className="text-sm text-gray-600">邮箱: {user.email}</p>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">❌ 未登录</p>
          )}
        </div>

        {/* API 测试 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API 测试</h2>
          <div className="flex gap-4 mb-4">
            <Button onClick={testInventoryAPI} disabled={loading}>
              测试背包API
            </Button>
            <Button onClick={testScoreAPI} disabled={loading}>
              测试评分API
            </Button>
          </div>

          {apiResult && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">API 响应:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">📋 说明</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>如果显示"已登录"，说明客户端认证正常</li>
            <li>点击"测试背包API"，如果返回 <code>isTestMode: false</code>，说明服务端也能正确识别登录状态</li>
            <li>如果返回 <code>isTestMode: true</code>，说明服务端无法获取会话，需要重启开发服务器</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
