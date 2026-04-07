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

export default function MongoDBConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(27017)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [database, setDatabase] = useState('admin')
  const [authDatabase, setAuthDatabase] = useState('admin')
  const [connectionString, setConnectionString] = useState('')
  const [useConnectionString, setUseConnectionString] = useState(false)
  const [remember, setRemember] = useState(true)

  if (!open) return null

  const save = () => {
    const conn: Connection = {
      id: `mongodb-${Date.now()}`,
      name: name || host,
      type: 'mongodb',
      host: useConnectionString ? connectionString : host,
      port: useConnectionString ? 0 : Number(port),
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
      if (!useConnectionString && !host) throw new Error('Host required')
      if (useConnectionString && !connectionString) throw new Error('Connection string required')
      setTestMsg(t('connection.connectionSuccess'))
    } catch (e: any) {
      setTestMsg(`${t('connection.testFailed')}: ${e.message || e}`)
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
        <ConnectionDialogHeader title={`${t('connection.new')} (MongoDB)`} onClose={onClose} />
        <ConnectionDialogTabs tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)} />
        <ConnectionDiagram leftLabel="Navicat" rightLabel={t('database.types.mongodb')} LeftIcon={CircleDot} RightIcon={Database} />
        <ConnectionDialogContent className="min-h-[420px] max-h-[480px] overflow-y-auto">
          {tab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.name')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={useConnectionString} onChange={(e) => setUseConnectionString(e.target.checked)} className="accent-blue-600" />
                {t('connection.useConnectionString')}
              </label>
              {useConnectionString ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.connectionString')}:</label>
                    <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={connectionString} onChange={(e) => setConnectionString(e.target.value)} placeholder="mongodb://username:password@host:port/database" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-[80px]">
                    {t('connection.mongodb.connectionStringExample')}
                  </div>
                </div>
              ) : (
                <>
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
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.username')}:</label>
                    <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('common.optional')} />
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.password')}:</label>
                    <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('common.optional')} />
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.authDatabase')}:</label>
                    <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" value={authDatabase} onChange={(e) => setAuthDatabase(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                    <div />
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" className="accent-blue-600" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      {t('connection.general.remember')}
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          {tab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.mongodb.replicaSet')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" placeholder={t('common.optional')} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.mongodb.readPreference')}:</label>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200">
                  <option>primary</option>
                  <option>primaryPreferred</option>
                  <option>secondary</option>
                  <option>secondaryPreferred</option>
                  <option>nearest</option>
                </select>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.connectionTimeout')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={10000} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.mongodb.socketTimeout')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={0} placeholder="0 = 无限制" />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.mongodb.maxPoolSize')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={10} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <div />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  {t('connection.advanced.autoConnect')}
                </label>
              </div>
            </div>
          )}
          {tab === 'ssl' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                {t('connection.ssl.useSSL')}
              </label>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <div />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  {t('connection.allowInvalidCert')}
                </label>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.caCert')}:</label>
                <div className="flex gap-2">
                  <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm flex-1 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                  <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">...</button>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientCert')}:</label>
                <div className="flex gap-2">
                  <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm flex-1 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                  <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">...</button>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientKey')}:</label>
                <div className="flex gap-2">
                  <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm flex-1 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                  <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">...</button>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.passphrase')}:</label>
                <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
            </div>
          )}
          {tab === 'ssh' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                {t('connection.ssh.useTunnel')}
              </label>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.host')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.port')}:</label>
                <input type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" defaultValue={22} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.username')}:</label>
                <input className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.authMethod')}:</label>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200">
                  <option>{t('connection.general.password')}</option>
                  <option>{t('connection.ssh.privateKey')}</option>
                </select>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.password')}:</label>
                <input type="password" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <div />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" />
                  {t('connection.ssh.remember')}
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
