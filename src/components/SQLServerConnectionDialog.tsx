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

type Tab = 'general' | 'advanced' | 'ssl' | 'ssh'

export default function SQLServerConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(1433)
  const [username, setUsername] = useState('sa')
  const [password, setPassword] = useState('')
  const [database, setDatabase] = useState('master')
  const [rememberPwd, setRememberPwd] = useState(true)
  const [authType, setAuthType] = useState<'sql' | 'windows'>('sql')

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `sqlserver-${Date.now()}`,
      name: name || `${host}:${port}`,
      type: 'sqlserver',
      host,
      port: Number(port),
      username: authType === 'sql' ? username : '',
      password: rememberPwd && authType === 'sql' ? password : undefined,
      database,
    }
    onSave(conn)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      const config = { host, port: Number(port), username, password, database }
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
    { id: 'ssl' as Tab, label: t('connection.tabs.ssl') },
    { id: 'ssh' as Tab, label: t('connection.tabs.ssh') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[750px] h-[650px] bg-gray-50 dark:bg-gray-800 rounded shadow-xl border border-gray-300 dark:border-gray-600 flex flex-col">
        <ConnectionDialogHeader title={`${t('connection.new')} (SQL Server)`} onClose={onClose} />
        <ConnectionDialogTabs tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)} />
        <ConnectionDiagram leftLabel="Navicat" rightLabel={t('database.types.sqlserver')} LeftIcon={CircleDot} RightIcon={Database} />
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
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.database')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={database} onChange={(e) => setDatabase(e.target.value)} />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.type')}:</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="authType" checked={authType === 'sql'} onChange={() => setAuthType('sql')} className="accent-blue-600" />
                    SQL Server 身份验证
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="authType" checked={authType === 'windows'} onChange={() => setAuthType('windows')} className="accent-blue-600" />
                    Windows 身份验证
                  </label>
                </div>
              </div>
              {authType === 'sql' && (
                <>
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
                </>
              )}
            </div>
          )}
          {tab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">实例名:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" placeholder={t('common.optional')} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">应用程序名称:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" placeholder="Catyas" />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">连接超时（秒）:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-24 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={15} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">查询超时（秒）:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-24 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={0} placeholder="0 = 无限制" />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  信任服务器证书
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  启用 MARS（多活动结果集）
                </label>
              </div>
            </div>
          )}
          {tab === 'ssl' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-600" />
                加密连接
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  信任服务器证书
                </label>
              </div>
            </div>
          )}
          {tab === 'ssh' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                {t('connection.ssh.useTunnel')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.host')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.port')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={22} />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.username')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.password')}:</label>
                <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
            </div>
          )}
        </ConnectionDialogContent>
        <ConnectionDialogFooter onTest={testConnection} onSave={save} onCancel={onClose} testing={testing} testMessage={testMsg} t={t} />
      </div>
    </div>
  )
}
