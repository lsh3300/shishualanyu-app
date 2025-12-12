'use client'

/**
 * 游戏系统诊断页面
 * Game System Debug Page
 * 
 * 帮助用户检查数据库状态和诊断问题
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, Database, User, Package } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'

interface TableStatus {
  [key: string]: boolean
}

interface DbStatus {
  initialized: boolean
  tables: TableStatus
  missingTables: string[]
  message: string
}

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [userStatus, setUserStatus] = useState<{
    loggedIn: boolean
    userId: string | null
    email: string | null
  } | null>(null)
  const [profileStatus, setProfileStatus] = useState<{
    exists: boolean
    data: any
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  // 检查数据库状态
  const checkDbStatus = async () => {
    try {
      const response = await fetch('/api/game/init-db')
      const result = await response.json()
      if (result.success) {
        setDbStatus(result.data)
      } else {
        setError(result.error?.message || '检查数据库状态失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

  // 检查用户状态
  const checkUserStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setUserStatus({ loggedIn: false, userId: null, email: null })
      } else if (user) {
        setUserStatus({
          loggedIn: true,
          userId: user.id,
          email: user.email || null
        })
        // 检查玩家档案
        await checkProfileStatus(user.id)
      } else {
        setUserStatus({ loggedIn: false, userId: null, email: null })
      }
    } catch (err) {
      setUserStatus({ loggedIn: false, userId: null, email: null })
    }
  }


  // 检查玩家档案状态
  const checkProfileStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        setProfileStatus({ exists: false, data: null })
      } else {
        setProfileStatus({ exists: true, data })
      }
    } catch (err) {
      setProfileStatus({ exists: false, data: null })
    }
  }

  // 创建玩家档案
  const createProfile = async () => {
    if (!userStatus?.userId) return

    try {
      const { data, error } = await supabase
        .from('player_profile')
        .insert({
          user_id: userStatus.userId,
          dye_house_name: '无名染坊',
          level: 1,
          exp: 0,
          currency: 100,
          total_cloths_created: 0,
          total_score: 0,
          highest_score: 0
        })
        .select()
        .single()

      if (error) {
        setError(`创建档案失败: ${error.message}`)
      } else {
        setProfileStatus({ exists: true, data })
        setError(null)
      }
    } catch (err: any) {
      setError(`创建档案失败: ${err.message}`)
    }
  }

  // 刷新所有状态
  const refreshAll = async () => {
    setLoading(true)
    setError(null)
    await Promise.all([checkDbStatus(), checkUserStatus()])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔧 游戏系统诊断
          </h1>
          <div className="flex gap-2">
            <Button onClick={refreshAll} disabled={loading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Link href="/game/shop">
              <Button variant="ghost">返回商店</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {/* 用户状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                用户状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {userStatus.loggedIn ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{userStatus.loggedIn ? '已登录' : '未登录'}</span>
                  </div>
                  {userStatus.loggedIn && (
                    <>
                      <p className="text-sm text-gray-600">
                        用户ID: <code className="bg-gray-100 px-1 rounded">{userStatus.userId}</code>
                      </p>
                      <p className="text-sm text-gray-600">
                        邮箱: {userStatus.email || '未设置'}
                      </p>
                    </>
                  )}
                  {!userStatus.loggedIn && (
                    <p className="text-sm text-orange-600">
                      请先登录后再使用游戏功能
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">加载中...</p>
              )}
            </CardContent>
          </Card>


          {/* 玩家档案状态 */}
          {userStatus?.loggedIn && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  玩家档案
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {profileStatus.exists ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span>{profileStatus.exists ? '档案存在' : '档案不存在'}</span>
                    </div>
                    {profileStatus.exists && profileStatus.data && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p>染坊名: {profileStatus.data.dye_house_name}</p>
                        <p>等级: {profileStatus.data.level}</p>
                        <p>经验: {profileStatus.data.exp}</p>
                        <p>货币: {profileStatus.data.currency}</p>
                      </div>
                    )}
                    {!profileStatus.exists && (
                      <div className="space-y-2">
                        <p className="text-sm text-orange-600">
                          玩家档案不存在，需要创建
                        </p>
                        <Button onClick={createProfile} size="sm">
                          创建玩家档案
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">加载中...</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 数据库状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                数据库状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbStatus ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {dbStatus.initialized ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{dbStatus.message}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(dbStatus.tables).map(([table, exists]) => (
                      <div
                        key={table}
                        className={`flex items-center gap-1 text-sm p-2 rounded ${
                          exists ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {exists ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {table}
                      </div>
                    ))}
                  </div>

                  {dbStatus.missingTables.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        ⚠️ 缺少以下表，请在 Supabase SQL Editor 中执行初始化脚本：
                      </h4>
                      <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                        <li>打开 Supabase Dashboard</li>
                        <li>进入 SQL Editor</li>
                        <li>复制 <code className="bg-yellow-100 px-1">supabase/migrations/game_system_init.sql</code> 的内容</li>
                        <li>执行 SQL 脚本</li>
                        <li>点击上方"刷新"按钮确认</li>
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">加载中...</p>
              )}
            </CardContent>
          </Card>

          {/* 快速测试 */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 快速测试</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Link href="/api/inventory">
                  <Button variant="outline" size="sm">测试背包API</Button>
                </Link>
                <Link href="/api/game/init-db">
                  <Button variant="outline" size="sm">测试数据库API</Button>
                </Link>
                <Link href="/game/inventory">
                  <Button variant="outline" size="sm">打开背包页面</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
