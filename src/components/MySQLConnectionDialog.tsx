import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Connection } from '../types'
import { Database as DatabaseIcon, CircleDot } from 'lucide-react'
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

export default function MySQLConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  // General tab state
  const [name, setName] = useState('')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(3306)
  const [username, setUsername] = useState('root')
  const [password, setPassword] = useState('')
  const [rememberPwd, setRememberPwd] = useState(true)

  // Advanced tab state
  const [settingsPath, setSettingsPath] = useState('')
  const [driver, setDriver] = useState('default')
  const [charset, setCharset] = useState('auto')
  const [keepAlive, setKeepAlive] = useState(false)
  const [keepAliveInterval, setKeepAliveInterval] = useState(240)
  const [useCompression, setUseCompression] = useState(false)
  const [autoConnect, setAutoConnect] = useState(false)
  const [limitSessions, setLimitSessions] = useState(false)
  const [maxSessions, setMaxSessions] = useState(10)

  // Database tab state
  const [useCustomDbList, setUseCustomDbList] = useState(false)
  const databases: string[] = []

  // SSL tab state
  const [useSSL, setUseSSL] = useState(false)
  const [useVerify, setUseVerify] = useState(false)
  const [clientKey, setClientKey] = useState('')
  const [clientCert, setClientCert] = useState('')
  const [caCert, setCaCert] = useState('')
  const [verifyServerCert, setVerifyServerCert] = useState(false)
  const [cipher, setCipher] = useState('')

  // SSH tab state
  const [useSSH, setUseSSH] = useState(false)
  const [sshHost, setSshHost] = useState('')
  const [sshPort, setSshPort] = useState(22)
  const [sshUsername, setSshUsername] = useState('')
  const [sshAuthMethod, setSshAuthMethod] = useState('password')
  const [sshPassword, setSshPassword] = useState('')
  const [sshRememberPwd, setSshRememberPwd] = useState(false)

  // HTTP tab state
  const [useHTTP, setUseHTTP] = useState(false)
  const [httpUrl, setHttpUrl] = useState('')
  const [useBase64, setUseBase64] = useState(false)
  const [httpTab, setHttpTab] = useState<'auth' | 'proxy'>('auth')
  const [httpUsePwd, setHttpUsePwd] = useState(false)
  const [httpUsername, setHttpUsername] = useState('')
  const [httpPassword, setHttpPassword] = useState('')
  const [httpRememberPwd, setHttpRememberPwd] = useState(false)
  const [httpUseCert, setHttpUseCert] = useState(false)
  const [httpClientKey, setHttpClientKey] = useState('')
  const [httpClientCert, setHttpClientCert] = useState('')
  const [httpCaCert, setHttpCaCert] = useState('')
  const [httpPassphrase, setHttpPassphrase] = useState('')

  if (!open) return null

  const handleSave = () => {
    const conn: Connection = {
      id: `mysql-${Date.now()}`,
      name: name || `${host}:${port}`,
      type: 'mysql',
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

  const handleBrowseFile = async (field: 'settings' | 'key' | 'cert' | 'ca') => {
    try {
      const result = await window.electronAPI?.openFileDialog()
      if (result?.success && result.filePath) {
        switch (field) {
          case 'settings':
            setSettingsPath(result.filePath)
            break
          case 'key':
            setClientKey(result.filePath)
            break
          case 'cert':
            setClientCert(result.filePath)
            break
          case 'ca':
            setCaCert(result.filePath)
            break
        }
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err)
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
        {/* Header */}
        <ConnectionDialogHeader
          title={`${t('connection.new')} (MySQL)`}
          onClose={onClose}
        />

        {/* Tabs */}
        <ConnectionDialogTabs
          tabs={tabs}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId as Tab)}
        />

        {/* Connection diagram */}
        <ConnectionDiagram
          leftLabel="Navicat"
          rightLabel={t('database.types.mysql')}
          LeftIcon={CircleDot}
          RightIcon={DatabaseIcon}
        />

        {/* Content */}
        <ConnectionDialogContent className="min-h-[420px] max-h-[480px] overflow-y-auto">
          {tab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.name')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.host')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.port')}:</label>
                <input
                  type="number"
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.username')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.password')}:</label>
                <input
                  type="password"
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <div />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={rememberPwd}
                    onChange={(e) => setRememberPwd(e.target.checked)}
                  />
                  {t('connection.general.remember')}
                </label>
              </div>
            </div>
          )}

          {tab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.settingsPath')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={settingsPath}
                  onChange={(e) => setSettingsPath(e.target.value)}
                />
                <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" onClick={() => handleBrowseFile('settings')}>...</button>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.driver')}:</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="mysqlnative">mysqlnative</option>
                </select>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.charset')}:</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={charset}
                  onChange={(e) => setCharset(e.target.value)}
                >
                  <option value="auto">Auto</option>
                  <option value="utf8">utf8</option>
                  <option value="utf8mb4">utf8mb4</option>
                  <option value="gbk">gbk</option>
                </select>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepAlive}
                    onChange={(e) => setKeepAlive(e.target.checked)}
                    className="accent-blue-600"
                  />
                  {t('connection.advanced.keepAlive')}:
                  <input
                    type="number"
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    value={keepAliveInterval}
                    onChange={(e) => setKeepAliveInterval(Number(e.target.value))}
                    disabled={!keepAlive}
                  />
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCompression}
                    onChange={(e) => setUseCompression(e.target.checked)}
                    className="accent-blue-600"
                  />
                  {t('connection.advanced.useCompression')}
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConnect}
                    onChange={(e) => setAutoConnect(e.target.checked)}
                    className="accent-blue-600"
                  />
                  {t('connection.advanced.autoConnect')}
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.namedPipe')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  disabled
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.advanced.limitSessions')}:</label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={limitSessions}
                    onChange={(e) => setLimitSessions(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <input
                    type="number"
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    value={maxSessions}
                    onChange={(e) => setMaxSessions(Number(e.target.value))}
                    disabled={!limitSessions}
                  />
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200">
                  {t('connection.advanced.compatibility')}
                </button>
              </div>
            </div>
          )}

          {tab === 'database' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomDbList}
                  onChange={(e) => setUseCustomDbList(e.target.checked)}
                  className="accent-blue-600"
                />
                {t('connection.dbtab.useCustomList')}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal">{t('connection.dbtab.database')}</th>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal w-24">{t('connection.dbtab.autoOpen')}</th>
                    </tr>
                  </thead>
                  <tbody className="h-64 overflow-auto">
                    {databases.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-8 text-center text-gray-400 dark:text-gray-500">
                          {t('connection.dbtab.noDatabases')}
                        </td>
                      </tr>
                    ) : (
                      databases.map((db) => (
                        <tr key={db} className="border-t border-gray-200 dark:border-gray-600">
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{db}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" className="accent-blue-600" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50" disabled>
                  {t('connection.dbtab.add')}
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50" disabled>
                  {t('connection.dbtab.remove')}
                </button>
              </div>
            </div>
          )}

          {tab === 'ssl' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSSL}
                  onChange={(e) => setUseSSL(e.target.checked)}
                  className="accent-blue-600"
                />
                {t('connection.ssl.useSSL')}
              </label>
              <fieldset className="border border-gray-300 dark:border-gray-600 rounded p-3">
                <legend className="text-xs text-gray-600 dark:text-gray-400 px-1">{t('connection.ssl.verification')}</legend>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVerify}
                      onChange={(e) => setUseVerify(e.target.checked)}
                      className="accent-blue-600"
                    />
                    {t('connection.ssl.useVerify')}
                  </label>
                  <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientKey')}:</label>
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={clientKey}
                      onChange={(e) => setClientKey(e.target.value)}
                      disabled={!useVerify}
                    />
                    <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useVerify} onClick={() => handleBrowseFile('key')}>...</button>
                  </div>
                  <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.clientCert')}:</label>
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={clientCert}
                      onChange={(e) => setClientCert(e.target.value)}
                      disabled={!useVerify}
                    />
                    <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useVerify} onClick={() => handleBrowseFile('cert')}>...</button>
                  </div>
                  <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.caCert')}:</label>
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={caCert}
                      onChange={(e) => setCaCert(e.target.value)}
                      disabled={!useVerify}
                    />
                    <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useVerify} onClick={() => handleBrowseFile('ca')}>...</button>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifyServerCert}
                        onChange={(e) => setVerifyServerCert(e.target.checked)}
                        className="accent-blue-600"
                        disabled={!useVerify}
                      />
                      {t('connection.ssl.verifyServer')}
                    </label>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssl.cipher')}:</label>
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={cipher}
                      onChange={(e) => setCipher(e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {tab === 'ssh' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSSH}
                  onChange={(e) => setUseSSH(e.target.checked)}
                  className="accent-blue-600"
                />
                {t('connection.ssh.useTunnel')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.host')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={sshHost}
                  onChange={(e) => setSshHost(e.target.value)}
                  disabled={!useSSH}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.port')}:</label>
                <input
                  type="number"
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={sshPort}
                  onChange={(e) => setSshPort(Number(e.target.value))}
                  disabled={!useSSH}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.username')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={sshUsername}
                  onChange={(e) => setSshUsername(e.target.value)}
                  disabled={!useSSH}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.authMethod')}:</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={sshAuthMethod}
                  onChange={(e) => setSshAuthMethod(e.target.value)}
                  disabled={!useSSH}
                >
                  <option value="password">{t('connection.general.password')}</option>
                  <option value="key">Key</option>
                </select>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.ssh.password')}:</label>
                <input
                  type="password"
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={sshPassword}
                  onChange={(e) => setSshPassword(e.target.value)}
                  disabled={!useSSH}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sshRememberPwd}
                    onChange={(e) => setSshRememberPwd(e.target.checked)}
                    className="accent-blue-600"
                    disabled={!useSSH}
                  />
                  {t('connection.ssh.remember')}
                </label>
              </div>
            </div>
          )}

          {tab === 'http' && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useHTTP}
                  onChange={(e) => setUseHTTP(e.target.checked)}
                  className="accent-blue-600"
                />
                {t('connection.http.useTunnel')}
              </label>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.url')}:</label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  disabled={!useHTTP}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBase64}
                    onChange={(e) => setUseBase64(e.target.checked)}
                    className="accent-blue-600"
                    disabled={!useHTTP}
                  />
                  {t('connection.http.useBase64')}
                </label>
              </div>

              {/* HTTP sub-tabs */}
              <div className="mt-4">
                <div className="flex gap-1 border-b border-gray-300 dark:border-gray-600 mb-3">
                  <button
                    onClick={() => setHttpTab('auth')}
                    className={`px-3 py-1 text-sm border border-b-0 rounded-t ${
                      httpTab === 'auth'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 -mb-px'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent'
                    }`}
                  >
                    {t('connection.http.auth')}
                  </button>
                  <button
                    onClick={() => setHttpTab('proxy')}
                    className={`px-3 py-1 text-sm border border-b-0 rounded-t ${
                      httpTab === 'proxy'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 -mb-px'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent'
                    }`}
                  >
                    {t('connection.http.proxy')}
                  </button>
                </div>

                {httpTab === 'auth' && (
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={httpUsePwd}
                        onChange={(e) => setHttpUsePwd(e.target.checked)}
                        className="accent-blue-600"
                        disabled={!useHTTP}
                      />
                      {t('connection.http.usePassword')}
                    </label>
                    <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.username')}:</label>
                      <input
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpUsername}
                        onChange={(e) => setHttpUsername(e.target.value)}
                        disabled={!useHTTP || !httpUsePwd}
                      />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.general.password')}:</label>
                      <input
                        type="password"
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpPassword}
                        onChange={(e) => setHttpPassword(e.target.value)}
                        disabled={!useHTTP || !httpUsePwd}
                      />
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300"></label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpRememberPwd}
                          onChange={(e) => setHttpRememberPwd(e.target.checked)}
                          className="accent-blue-600"
                          disabled={!useHTTP || !httpUsePwd}
                        />
                        {t('connection.general.remember')}
                      </label>
                    </div>
                  </div>
                )}

                {httpTab === 'proxy' && (
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={httpUseCert}
                        onChange={(e) => setHttpUseCert(e.target.checked)}
                        className="accent-blue-600"
                        disabled={!useHTTP}
                      />
                      {t('connection.http.useCertAuth')}
                    </label>
                    <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.clientKey')}:</label>
                      <input
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpClientKey}
                        onChange={(e) => setHttpClientKey(e.target.value)}
                        disabled={!useHTTP || !httpUseCert}
                      />
                      <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useHTTP || !httpUseCert} onClick={() => handleBrowseFile('key')}>...</button>
                    </div>
                    <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.clientCert')}:</label>
                      <input
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpClientCert}
                        onChange={(e) => setHttpClientCert(e.target.value)}
                        disabled={!useHTTP || !httpUseCert}
                      />
                      <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useHTTP || !httpUseCert} onClick={() => handleBrowseFile('cert')}>...</button>
                    </div>
                    <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.caCert')}:</label>
                      <input
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpCaCert}
                        onChange={(e) => setHttpCaCert(e.target.value)}
                        disabled={!useHTTP || !httpUseCert}
                      />
                      <button className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200" disabled={!useHTTP || !httpUseCert} onClick={() => handleBrowseFile('ca')}>...</button>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                      <label className="text-right text-sm text-gray-700 dark:text-gray-300">{t('connection.http.passphrase')}:</label>
                      <input
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={httpPassphrase}
                        onChange={(e) => setHttpPassphrase(e.target.value)}
                        disabled={!useHTTP || !httpUseCert}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </ConnectionDialogContent>

        {/* Footer */}
        <ConnectionDialogFooter
          onTest={testConnection}
          onSave={handleSave}
          onCancel={onClose}
          testing={testing}
          testMessage={testMsg}
          t={t}
        />
      </div>
    </div>
  )
}
