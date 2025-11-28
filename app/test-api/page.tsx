'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAPIPage() {
  const { user, getToken } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testAPI = async () => {
    setLogs([])
    setResult(null)
    
    addLog('=== 开始测试 ===')
    
    // 1. 检查用户登录状态
    addLog(`1. 用户登录状态: ${user ? '✅ 已登录' : '❌ 未登录'}`)
    if (user) {
      addLog(`   用户ID: ${user.id}`)
      addLog(`   用户邮箱: ${user.email}`)
    }
    
    if (!user) {
      addLog('❌ 请先登录！')
      return
    }
    
    // 2. 获取token
    addLog('2. 正在获取token...')
    try {
      const token = await getToken()
      if (!token) {
        addLog('❌ 无法获取token')
        return
      }
      addLog(`✅ Token获取成功 (长度: ${token.length})`)
      addLog(`   Token前50字符: ${token.substring(0, 50)}...`)
      
      // 3. 调用成就API
      addLog('3. 调用 /api/user/achievements...')
      const response = await fetch('/api/user/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`   响应状态: ${response.status} ${response.statusText}`)
      
      // 4. 解析响应
      const data = await response.json()
      addLog('4. 响应数据:')
      addLog(JSON.stringify(data, null, 2))
      
      setResult(data)
      
      if (data.error) {
        addLog(`❌ API返回错误: ${data.error}`)
      } else {
        addLog('✅ 成功获取成就数据！')
      }
      
    } catch (error) {
      addLog(`❌ 发生错误: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Test API Error:', error)
    }
  }

  const testLikeAPI = async () => {
    setLogs([])
    setResult(null)
    
    addLog('=== 测试点赞API ===')
    
    if (!user) {
      addLog('❌ 请先登录！')
      return
    }
    
    try {
      const token = await getToken()
      if (!token) {
        addLog('❌ 无法获取token')
        return
      }
      
      // 使用一个测试课程ID
      const testCourseId = 'de8350d9-e4a2-4f44-9c21-4736ef65e549'
      addLog(`测试课程ID: ${testCourseId}`)
      
      // 先获取点赞状态
      addLog('1. 获取点赞状态...')
      const getResponse = await fetch(`/api/courses/${testCourseId}/like`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      addLog(`   响应: ${getResponse.status}`)
      const getData = await getResponse.json()
      addLog(`   数据: ${JSON.stringify(getData)}`)
      
      // 尝试点赞
      addLog('2. 尝试点赞...')
      const postResponse = await fetch(`/api/courses/${testCourseId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`   响应: ${postResponse.status}`)
      const postData = await postResponse.json()
      addLog(`   数据: ${JSON.stringify(postData)}`)
      
      setResult(postData)
      
    } catch (error) {
      addLog(`❌ 错误: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API 测试页面</h1>
      
      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>用户状态</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ 已登录</p>
                <p className="text-sm">用户ID: {user.id}</p>
                <p className="text-sm">邮箱: {user.email}</p>
              </div>
            ) : (
              <p className="text-red-600 font-semibold">❌ 未登录 - 请先登录</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API 测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testAPI} className="w-full">
              测试成就 API
            </Button>
            <Button onClick={testLikeAPI} className="w-full" variant="outline">
              测试点赞 API
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>执行日志</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {logs.join('\n')}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>API 响应</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-blue-50 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
