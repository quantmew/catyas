import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Connection } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (conn: Connection) => void
}

export default function PostgreSQLConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(5432)
  const [username, setUsername] = useState('postgres')
  const [password, setPassword] = useState('')
  const [database, setDatabase] = useState('postgres')
  const [remember, setRemember] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [tab, setTab] = useState<'general'|'advanced'|'ssl'|'ssh'>('general')

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `postgresql-${Date.now()}`,
      name: name || host,
      type: 'postgresql',
      host,
      port: Number(port),
      username,
      password: remember ? password : undefined,
      database,
    }
    onSave(conn)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      if (!host) throw new Error('Host required')
      setTestMsg(t('connection.connectionSuccess'))
    } catch (e: any) {
      setTestMsg(`${t('connection.testFailed')}: ${e.message || e}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[680px] bg-white dark:bg-neutral-900 rounded shadow-lg border border-gray-200 dark:border-neutral-700">
        <div className="px-4 py-2 border-b text-sm font-semibold bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100">{t('connection.new')} (PostgreSQL)</div>
        <div className="px-4 pt-3">
          <div className="flex gap-2 mb-3">
            {[
              {k:'general', t:t('connection.tabs.general')},
              {k:'advanced', t:t('connection.tabs.advanced')},
              {k:'ssl', t:t('connection.tabs.ssl')},
              {k:'ssh', t:t('connection.tabs.ssh')},
            ].map(({k,t})=> (
              <button key={k} className={`px-3 py-1 text-sm border rounded-t ${tab===k?'bg-white border-b-0':'bg-gray-100 hover:bg-gray-200'} `} onClick={()=>setTab(k as any)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-4">
          {tab==='general' && (
          <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 items-center">
            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.general.name')}:</label>
            <input className="border rounded px-2 py-1 text-sm w-full" value={name} onChange={(e)=>setName(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.general.host')}:</label>
            <input className="border rounded px-2 py-1 text-sm" value={host} onChange={(e)=>setHost(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.general.port')}:</label>
            <input className="border rounded px-2 py-1 text-sm w-24" type="number" value={port} onChange={(e)=>setPort(Number(e.target.value))} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.database')}:</label>
            <input className="border rounded px-2 py-1 text-sm" value={database} onChange={(e)=>setDatabase(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.general.username')}:</label>
            <input className="border rounded px-2 py-1 text-sm" value={username} onChange={(e)=>setUsername(e.target.value)} />

            <label className="text-right text-sm text-gray-600 dark:text-gray-300">{t('connection.general.password')}:</label>
            <input className="border rounded px-2 py-1 text-sm" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

            <div />
            <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="accent-blue-600" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> {t('connection.general.remember')}
            </label>
          </div>
          )}
          {tab==='advanced' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="text-right text-sm">连接超时（秒）:</label>
              <input className="border rounded px-2 py-1 text-sm w-24" defaultValue={10} />
              <label className="text-right text-sm">查询超时（秒）:</label>
              <input className="border rounded px-2 py-1 text-sm w-24" defaultValue={0} placeholder="0 = 无限制" />
              <label className="text-right text-sm">模式:</label>
              <input className="border rounded px-2 py-1 text-sm" placeholder="public" />
              <label className="text-right text-sm"></label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> {t('connection.advanced.useCompression')}</label>
              <label className="text-right text-sm"></label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> {t('connection.advanced.autoConnect')}</label>
            </div>
          )}
          {tab==='ssl' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="text-right text-sm">SSL 模式:</label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>disable</option>
                <option>require</option>
                <option>verify-ca</option>
                <option>verify-full</option>
              </select>
              <label className="text-right text-sm">{t('connection.ssl.clientCert')}:</label>
              <div className="flex gap-2"><input className="border rounded px-2 py-1 text-sm flex-1"/><button className="px-2 py-1 border rounded text-sm">...</button></div>
              <label className="text-right text-sm">{t('connection.ssl.clientKey')}:</label>
              <div className="flex gap-2"><input className="border rounded px-2 py-1 text-sm flex-1"/><button className="px-2 py-1 border rounded text-sm">...</button></div>
              <label className="text-right text-sm">{t('connection.ssl.caCert')}:</label>
              <div className="flex gap-2"><input className="border rounded px-2 py-1 text-sm flex-1"/><button className="px-2 py-1 border rounded text-sm">...</button></div>
            </div>
          )}
          {tab==='ssh' && (
            <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 items-center">
              <label className="inline-flex items-center gap-2 text-sm col-span-2"><input type="checkbox"/> {t('connection.ssh.useTunnel')}</label>
              <label className="text-right text-sm">{t('connection.ssh.host')}:</label>
              <input className="border rounded px-2 py-1 text-sm" />
              <label className="text-right text-sm">{t('connection.ssh.port')}:</label>
              <input className="border rounded px-2 py-1 text-sm w-24" defaultValue={22} />
              <label className="text-right text-sm">{t('connection.ssh.username')}:</label>
              <input className="border rounded px-2 py-1 text-sm" />
              <label className="text-right text-sm">{t('connection.ssh.authMethod')}:</label>
              <select className="border rounded px-2 py-1 text-sm"><option>{t('connection.general.password')}</option><option>私钥</option></select>
              <label className="text-right text-sm">{t('connection.ssh.password')}:</label>
              <input className="border rounded px-2 py-1 text-sm" type="password" />
              <label className="text-right text-sm"></label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox"/> {t('connection.ssh.remember')}</label>
            </div>
          )}

          {testMsg && (
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{testMsg}</div>
          )}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50 dark:bg-neutral-800">
          <button className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50" onClick={testConnection} disabled={testing}>
            {testing ? t('connection.testing') : t('connection.testConnection')}
          </button>
          <div className="space-x-2">
            <button className="px-3 py-1.5 text-sm border rounded" onClick={onClose}>{t('connection.cancel')}</button>
            <button className="px-3 py-1.5 text-sm border rounded bg-blue-600 text-white" onClick={save}>{t('connection.ok')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
