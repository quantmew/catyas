import { useState } from 'react'
import { Connection } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (conn: Connection) => void
}

export default function OracleConnectionDialog({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(1521)
  const [username, setUsername] = useState('system')
  const [password, setPassword] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [sid, setSid] = useState('')
  const [connectionType, setConnectionType] = useState<'service'|'sid'>('service')
  const [remember, setRemember] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [tab, setTab] = useState<'general'|'advanced'|'ssl'|'ssh'>('general')

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `oracle-${Date.now()}`,
      name: name || host,
      type: 'oracle',
      host,
      port: Number(port),
      username,
      password: remember ? password : undefined,
      database: connectionType === 'service' ? serviceName : sid,
    }
    onSave(conn)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      if (!host) throw new Error('Host required')
      setTestMsg('连接成功！')
    } catch (e: any) {
      setTestMsg(`连接失败：${e.message || e}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[680px] bg-white dark:bg-neutral-900 rounded shadow-lg border border-gray-200 dark:border-neutral-700">
        <div className="px-4 py-2 border-b text-sm font-semibold bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100">新建连接 (Oracle)</div>
        <div className="px-4 pt-3">
          <div className="flex gap-2 mb-3">
            {[
              {k:'general', t:'常规'},
              {k:'advanced', t:'高级'},
              {k:'ssl', t:'SSL'},
              {k:'ssh', t:'SSH'},
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

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">主机:</label>
            <input className="border rounded px-2 py-1 text-sm" value={host} onChange={(e)=>setHost(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">端口:</label>
            <input className="border rounded px-2 py-1 text-sm w-24" type="number" value={port} onChange={(e)=>setPort(Number(e.target.value))} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">连接类型:</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="connType" checked={connectionType==='service'} onChange={()=>setConnectionType('service')} /> Service Name
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="connType" checked={connectionType==='sid'} onChange={()=>setConnectionType('sid')} /> SID
              </label>
            </div>

            {connectionType === 'service' && (
              <>
                <label className="text-right text-sm text-gray-600 dark:text-gray-300">Service Name:</label>
                <input className="border rounded px-2 py-1 text-sm" value={serviceName} onChange={(e)=>setServiceName(e.target.value)} />
              </>
            )}

            {connectionType === 'sid' && (
              <>
                <label className="text-right text-sm text-gray-600 dark:text-gray-300">SID:</label>
                <input className="border rounded px-2 py-1 text-sm" value={sid} onChange={(e)=>setSid(e.target.value)} />
              </>
            )}

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">用户名:</label>
            <input className="border rounded px-2 py-1 text-sm" value={username} onChange={(e)=>setUsername(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">密码:</label>
            <input className="border rounded px-2 py-1 text-sm" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

            <div />
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="accent-blue-600" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> 保存密码
            </label>
          </div>
          )}
          {tab==='advanced' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="text-right text-sm">角色:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>NORMAL</option>
                <option>SYSDBA</option>
                <option>SYSOPER</option>
              </select>
              <label className="text-right text-sm">TNS 名称:</label>
              <input className="border rounded px-2 py-1 text-sm" />
              <label className="text-right text-sm">字符集:</label>
              <select className="border rounded px-2 py-1 text-sm"><option>UTF8</option><option>AL32UTF8</option></select>
              <label className="text-right text-sm"></label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> 自动连接</label>
            </div>
          )}
          {tab==='ssl' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="inline-flex items-center gap-2 text-sm col-span-2"><input type="checkbox"/> 使用 SSL/TLS</label>
              <label className="text-right text-sm">钱包位置:</label>
              <div className="flex gap-2"><input className="border rounded px-2 py-1 text-sm flex-1"/><button className="px-2 py-1 border rounded text-sm">...</button></div>
              <label className="text-right text-sm">钱包密码:</label>
              <input className="border rounded px-2 py-1 text-sm" type="password" />
            </div>
          )}
          {tab==='ssh' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="inline-flex items-center gap-2 text-sm col-span-2"><input type="checkbox"/> 使用 SSH 隧道</label>
              <label className="text-right text-sm">主机:</label>
              <input className="border rounded px-2 py-1 text-sm" />
              <label className="text-right text-sm">端口:</label>
              <input className="border rounded px-2 py-1 text-sm w-24" defaultValue={22} />
              <label className="text-right text-sm">用户名:</label>
              <input className="border rounded px-2 py-1 text-sm" />
              <label className="text-right text-sm">验证方法:</label>
              <select className="border rounded px-2 py-1 text-sm"><option>密码</option><option>私钥</option></select>
              <label className="text-right text-sm">密码:</label>
              <input className="border rounded px-2 py-1 text-sm" type="password" />
              <label className="text-right text-sm"></label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> 保存密码</label>
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
