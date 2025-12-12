'use client'

import { useState } from 'react'

// 生成UUID v4格式的ID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function TestUUIDPage() {
  const [uuids, setUuids] = useState<string[]>([])

  const generateNew = () => {
    const newUuid = generateUUID()
    setUuids([newUuid, ...uuids])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">UUID 生成测试</h1>
        
        <button
          onClick={generateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
        >
          生成新 UUID
        </button>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">生成的 UUID 列表：</h2>
          {uuids.length === 0 ? (
            <p className="text-gray-500">点击按钮生成 UUID</p>
          ) : (
            <ul className="space-y-2">
              {uuids.map((uuid, index) => (
                <li key={index} className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {uuid}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">✅ 正确的 UUID v4 格式：</h3>
          <p className="font-mono text-sm text-yellow-900">
            xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            例如: a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8
          </p>
        </div>

        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">❌ 错误的格式（旧版本）：</h3>
          <p className="font-mono text-sm text-red-900">
            cloth-1765457553591
          </p>
          <p className="text-sm text-red-700 mt-2">
            如果看到这种格式，说明需要清除浏览器缓存并重启服务器
          </p>
        </div>
      </div>
    </div>
  )
}
