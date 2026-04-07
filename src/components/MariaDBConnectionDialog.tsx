import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Connection } from '../types'
import { Database, CircleDot } from 'lucide-react'
import {
  ConnectionDialogHeader,
  ConnectionDiagram,
  ConnectionDialogTabs,
  ConnectionDialogContent,
  ConnectionDialogFooter
} from './ConnectionDialogBase'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (conn: Connection) => void
}

type Tab = 'general' | 'advanced' | 'database' | 'ssl' | 'ssh' | 'http'

export default function MariaDBConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(3306)
  const [username, setUsername] = useState('root')
  const [password, setPassword] = useState('')
  const [rememberPwd, setRememberPwd] = useState(true)

  const [driver, setDriver] = useState('default')
  const [charset, setCharset] = useState('utf8mb4')
  const [keepAlive, setKeepAlive] = useState(false)
  const [keepAliveInterval, setKeepAliveInterval] = useState(240)
  const [useCompression, setUseCompression] = useState(false)
  const [autoConnect, setAutoConnect] = useState(false)

  const [useSSL, setUseSSL] = useState(false)
  const [clientKey, setClientKey] = useState('')
  const [clientCert, setClientCert] = useState('')
  const [caCert, setCaCert] = useState('')

  const [useSSH, setUseSSH] = useState(false)
  const [sshHost, setSshHost] = useState('')
  const [sshPort, setSshPort] = useState(22)
  const [sshUsername, setSshUsername] = useState('')
  const [sshPassword, setSshPassword] = useState('')

  const [useHTTP, setUseHTTP] = useState(false)
  const [httpUrl, setHttpUrl] = useState('')
  const [useBase64, setUseBase64] = useState(false)

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `mariadb-${Date.now()}`,
      name: name || `${host}:${port}`,
      type: 'mariadb',
      host,
      port: Number(port),
      username,
      password: rememberPwd ? password : undefined,
    }
    onSave(conn)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      const config = { host, port: Number(port), username, password }
      const res = await window.electronAPI?.testConnection(config)
      if (res?.success) {
        setTestMsg(t('connection.connectionSuccess'))
      } else {
        setTestMsg(`${t('connection.testFailed')}: ${res?.message || 'Unknown error'}`)
      }
    } catch (e: any) {
      setTestMsg(`${t('connection.testFailed')}: ${e?.message || e}`)
    } finally {
      setTesting(false)
    }
  }

  const tabs = [
    { id: 'general' as Tab, label: t('connection.tabs.general') },
    { id: 'advanced' as Tab, label: t('connection.tabs.advanced') },
    { id: 'database' as Tab, label: t('connection.tabs.database') },
    { id: 'ssl' as Tab, label: t('connection.tabs.ssl') },
    { id: 'ssh' as Tab, label: t('connection.tabs.ssh') },
    { id: 'http' as Tab, label: t('connection.tabs.http') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[750px] h-[650px] bg-gray-50 dark:bg-gray-800 rounded shadow-xl border border-gray-300 dark:border-gray-600 flex flex-col">
        <ConnectionDialogHeader title={`${t('connection.new')} (MariaDB)`} onClose={onClose} />
        <ConnectionDialogTabs tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)} />
        <ConnectionDiagram leftLabel="Navicat" rightLabel={t('database.types.mariadb')} LeftIcon={CircleDot} RightIcon={Database} />
        <ConnectionDialogContent className="min-h-[420px] max-h-[480px] overflow-y-auto">
          {tab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.name')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.host')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={host} onChange={(e) => setHost(e.target.value)} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.port')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={port} onChange={(e) => setPort(Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.username')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.password')}:</label>
                <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <div />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" checked={rememberPwd} onChange={(e) => setRememberPwd(e.target.checked)} />
                  {t('connection.general.remember')}
                </label>
              </div>
            </div>
          )}
          {tab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.driver')}:</label>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={driver} onChange={(e) => setDriver(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="mariadbnative">MariaDB Native</option>
                </select>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.charset')}:</label>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={charset} onChange={(e) => setCharset(e.target.value)}>
                  <option value="utf8mb4">utf8mb4</option>
                  <option value="utf8">utf8</option>
                  <option value="latin1">latin1</option>
                </select>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={keepAlive} onChange={(e) => setKeepAlive(e.target.checked)} className="accent-blue-600" />
                  {t('connection.advanced.keepAlive')}:
                  <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={keepAliveInterval} onChange={(e) => setKeepAliveInterval(Number(e.target.value))} disabled={!keepAlive} />
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={useCompression} onChange={(e) => setUseCompression(e.target.checked)} className="accent-blue-600" />
                  {t('connection.advanced.useCompression')}
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} className="accent-blue-600" />
                  {t('connection.advanced.autoConnect')}
                </label>
              </div>
            </div>
          )}
          {tab === 'database' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                {t('connection.dbtab.useCustomList')}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                {t('connection.dbtab.noDatabases')}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50" disabled>{t('connection.dbtab.add')}</button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50" disabled>{t('connection.dbtab.remove')}</button>
              </div>
            </div>
          )}
          {tab === 'ssl' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={useSSL} onChange={(e) => setUseSSL(e.target.checked)} className="accent-blue-600" />
                {t('connection.ssl.useSSL')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientKey')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={clientKey} onChange={(e) => setClientKey(e.target.value)} disabled={!useSSL} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientCert')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={clientCert} onChange={(e) => setClientCert(e.target.value)} disabled={!useSSL} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.caCert')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={caCert} onChange={(e) => setCaCert(e.target.value)} disabled={!useSSL} />
              </div>
            </div>
          )}
          {tab === 'ssh' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={useSSH} onChange={(e) => setUseSSH(e.target.checked)} className="accent-blue-600" />
                {t('connection.ssh.useTunnel')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.host')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={sshHost} onChange={(e) => setSshHost(e.target.value)} disabled={!useSSH} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.port')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={sshPort} onChange={(e) => setSshPort(Number(e.target.value))} disabled={!useSSH} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.username')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={sshUsername} onChange={(e) => setSshUsername(e.target.value)} disabled={!useSSH} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.password')}:</label>
                <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={sshPassword} onChange={(e) => setSshPassword(e.target.value)} disabled={!useSSH} />
              </div>
            </div>
          )}
          {tab === 'http' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={useHTTP} onChange={(e) => setUseHTTP(e.target.checked)} className="accent-blue-600" />
                {t('connection.http.useTunnel')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.url')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={httpUrl} onChange={(e) => setHttpUrl(e.target.value)} disabled={!useHTTP} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={useBase64} onChange={(e) => setUseBase64(e.target.checked)} className="accent-blue-600" disabled={!useHTTP} />
                  {t('connection.http.useBase64')}
                </label>
              </div>
            </div>
          )}
        </ConnectionDialogContent>
        <ConnectionDialogFooter onTest={testConnection} onSave={save} onCancel={onClose} testing={testing} testMessage={testMsg} t={t} />
      </div>
    </div>
  )
}
