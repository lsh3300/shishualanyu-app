'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Copy } from 'lucide-react'

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; requiresManualSetup?: boolean; sql?: string } | null>(null)
  const [sqlCopied, setSqlCopied] = useState(false)

  const initDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/init-db-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: `数据库初始化成功！已创建 ${data.count} 条示例数据。`
        })
      } else {
        setResult({
          success: false,
          message: data.message || `初始化失败: ${data.error || '未知错误'}`,
          requiresManualSetup: data.requiresManualSetup,
          sql: data.sql
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql)
      setSqlCopied(true)
      setTimeout(() => setSqlCopied(false), 2000)
    }
  }

  const openSupabaseConsole = () => {
    window.open('https://supabase.com/dashboard', '_blank')
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>数据库初始化</CardTitle>
          <CardDescription>
            如果您是第一次使用本应用，或者产品数据为空，请点击下方按钮初始化数据库。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "成功" : "需要手动操作"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <Button 
              onClick={initDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在初始化数据库...
                </>
              ) : (
                "初始化数据库"
              )}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              初始化将创建products表并插入示例数据
            </p>
          </div>

          {result?.requiresManualSetup && result.sql && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">手动初始化步骤：</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside mb-4">
                <li>点击下方按钮打开Supabase控制台</li>
                <li>在左侧导航栏中，点击"SQL Editor"</li>
                <li>点击"New query"创建新查询</li>
                <li>复制并粘贴下方SQL代码</li>
                <li>点击"Run"执行SQL脚本</li>
                <li>执行完成后，返回此页面再次点击"初始化数据库"按钮</li>
              </ol>
              
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openSupabaseConsole}
                  className="flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  打开Supabase控制台
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="flex items-center"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {sqlCopied ? "已复制" : "复制SQL代码"}
                </Button>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-xs font-medium mb-2">SQL代码：</p>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {result.sql}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}