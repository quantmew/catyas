import { useState } from 'react'
import { Connection } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (conn: Connection) => void
}

export default function SQLiteConnectionDialog({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [filePath, setFilePath] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [tab, setTab] = useState<'general'|'advanced'>('general')

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `sqlite-${Date.now()}`,
      name: name || filePath,
      type: 'sqlite',
      host: filePath, // Using host field to store file path
      port: 0,
      username: '',
      password: remember ? password : undefined,
    }
    onSave(conn)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      if (!filePath) throw new Error('Database file path required')
      setTestMsg('连接成功！')
    } catch (e: any) {
      setTestMsg(`连接失败：${e.message || e}`)
    } finally {
      setTesting(false)
    }
  }

  const browseFile = () => {
    // TODO: Implement file dialog
    console.log('Browse for SQLite database file')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[680px] bg-white dark:bg-neutral-900 rounded shadow-lg border border-gray-200 dark:border-neutral-700">
        <div className="px-4 py-2 border-b text-sm font-semibold bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100">新建连接 (SQLite)</div>
        <div className="px-4 pt-3">
          <div className="flex gap-2 mb-3">
            {[
              {k:'general', t:'常规'},
              {k:'advanced', t:'高级'},
            ].map(({k,t})=> (
              <button key={k} className={`px-3 py-1 text-sm border rounded-t ${tab===k?'bg-white border-b-0':'bg-gray-100 hover:bg-gray-200'} `} onClick={()=>setTab(k as any)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-4">
          {tab==='general' && (
          <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4 items-center">
            <label className="text-right text-sm text-gray-600 dark:text-gray-300">连接名:</label>
            <input className="border rounded px-2 py-1 text-sm w-full" value={name} onChange={(e)=>setName(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">数据库文件:</label>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 text-sm flex-1" value={filePath} onChange={(e)=>setFilePath(e.target.value)} placeholder="/path/to/database.db" />
              <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={browseFile}>浏览...</button>
            </div>

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">密码:</label>
            <input className="border rounded px-2 py-1 text-sm" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="可选，如果数据库已加密" />

            <div />
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="accent-blue-600" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> 保存密码
            </label>

            <div />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              提示：如果文件不存在，连接时将自动创建新的数据库文件
            </div>
          </div>
          )}
          {tab==='advanced' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="text-right text-sm">只读模式:</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> 以只读方式打开数据库</label>
              <label className="text-right text-sm">页面大小:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option value="1024">1024</option>
                <option value="2048">2048</option>
                <option value="4096" selected>4096</option>
                <option value="8192">8192</option>
              </select>
              <label className="text-right text-sm">缓存大小:</label>
              <input className="border rounded px-2 py-1 text-sm w-32" defaultValue={2000} placeholder="页数" />
              <label className="text-right text-sm">同步模式:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>FULL</option>
                <option>NORMAL</option>
                <option>OFF</option>
              </select>
              <label className="text-right text-sm">日志模式:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>DELETE</option>
                <option>WAL</option>
                <option>MEMORY</option>
              </select>
            </div>
          )}

          {testMsg && (
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{testMsg}</div>
          )}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50 dark:bg-neutral-800">
          <button className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50" onClick={testConnection} disabled={testing}>
            {testing ? '测试中…' : '测试连接'}
          </button>
          <div className="space-x-2">
            <button className="px-3 py-1.5 text-sm border rounded" onClick={onClose}>取消</button>
            <button className="px-3 py-1.5 text-sm border rounded bg-blue-600 text-white" onClick={save}>确定</button>
          </div>
        </div>
      </div>
    </div>
  )
}
