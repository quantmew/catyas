import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Connection } from '../types'
import { Database, CircleDot, FolderOpen, Plus, Minus } from 'lucide-react'
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

type DbType = 'existing' | 'new3' | 'new2'

interface AttachedDatabase {
  id: string
  name: string
  file: string
  encrypted: boolean
}

export default function SQLiteConnectionDialog({ open, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'general' | 'advanced' | 'attached' | 'http'>('general')
  const [dbType, setDbType] = useState<DbType>('existing')

  // General tab
  const [connectionName, setConnectionName] = useState('')
  const [dbFilePath, setDbFilePath] = useState('')
  const [dbUsername, setDbUsername] = useState('')
  const [dbPassword, setDbPassword] = useState('')
  const [rememberPassword, setRememberPassword] = useState(true)

  // Advanced tab
  const [settingsPath, setSettingsPath] = useState('')
  const [autoConnect, setAutoConnect] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [encryptPassword, setEncryptPassword] = useState('')
  const [saveEncryptPassword, setSaveEncryptPassword] = useState(false)

  // Attached databases
  const [attachedDbs, setAttachedDbs] = useState<AttachedDatabase[]>([])

  // HTTP tab
  const [useHttpTunnel, setUseHttpTunnel] = useState(false)
  const [tunnelUrl, setTunnelUrl] = useState('')
  const [useBase64, setUseBase64] = useState(false)
  const [httpAuthTab, setHttpAuthTab] = useState<'auth' | 'proxy'>('auth')
  const [usePasswordAuth, setUsePasswordAuth] = useState(false)
  const [httpUsername, setHttpUsername] = useState('')
  const [httpPassword, setHttpPassword] = useState('')
  const [saveHttpPassword, setSaveHttpPassword] = useState(false)
  const [useCertAuth, setUseCertAuth] = useState(false)
  const [clientKeyPath, setClientKeyPath] = useState('')
  const [clientCertPath, setClientCertPath] = useState('')
  const [caCertPath, setCaCertPath] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  if (!open) return null

  const handleBrowseFile = async (field: 'db' | 'settings' | 'key' | 'cert' | 'ca') => {
    try {
      let result
      if (field === 'db' && dbType !== 'existing') {
        // For new databases, use save dialog
        result = await window.electronAPI?.saveFileDialog({
          title: '新建 SQLite 数据库',
          filters: [
            { name: 'SQLite Database', extensions: ['db', 'sqlite3'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })
      } else {
        // For existing databases and other fields, use open dialog
        result = await window.electronAPI?.openFileDialog({
          filters: field === 'db' ? [
            { name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] },
            { name: 'All Files', extensions: ['*'] }
          ] : undefined
        })
      }
      if (result?.success && result.filePath) {
        switch (field) {
          case 'db':
            setDbFilePath(result.filePath)
            if (!connectionName) setConnectionName(result.filePath.split(/[/\\]/).pop() || '')
            break
          case 'settings':
            setSettingsPath(result.filePath)
            break
          case 'key':
            setClientKeyPath(result.filePath)
            break
          case 'cert':
            setClientCertPath(result.filePath)
            break
          case 'ca':
            setCaCertPath(result.filePath)
            break
        }
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err)
    }
  }

  const handleAddAttachedDb = () => {
    const newDb: AttachedDatabase = {
      id: `db-${Date.now()}`,
      name: `Database_${attachedDbs.length + 1}`,
      file: '',
      encrypted: false
    }
    setAttachedDbs([...attachedDbs, newDb])
  }

  const handleRemoveAttachedDb = (id: string) => {
    setAttachedDbs(attachedDbs.filter(db => db.id !== id))
  }

  const handleUpdateAttachedDb = (id: string, updates: Partial<AttachedDatabase>) => {
    setAttachedDbs(attachedDbs.map(db =>
      db.id === id ? { ...db, ...updates } : db
    ))
  }

  const testConnection = async () => {
    setTesting(true)
    setTestMsg(null)

    try {
      const config = {
        type: 'sqlite',
        filePath: dbFilePath,
        username: dbUsername,
        password: rememberPassword ? dbPassword : undefined,
        encrypted: isEncrypted,
        encryptPassword: isEncrypted ? encryptPassword : undefined
      }

      const result = await window.electronAPI?.testConnection(config)
      if (result?.success) {
        setTestMsg(t('connection.connectionSuccess'))
      } else {
        setTestMsg(`${t('connection.testFailed')}: ${result?.message || 'Unknown error'}`)
      }
    } catch (e: any) {
      setTestMsg(`${t('connection.testFailed')}: ${e.message || e}`)
    } finally {
      setTesting(false)
    }
  }

  const save = async () => {
    if (!dbFilePath) return

    // For new databases, create the SQLite file
    if (dbType !== 'existing' && dbFilePath) {
      try {
        await window.electronAPI?.createSqliteDatabase(dbFilePath)
      } catch (err) {
        console.error('Failed to create SQLite database:', err)
      }
    }

    const conn: Connection = {
      id: `sqlite-${Date.now()}`,
      name: connectionName || dbFilePath || 'SQLite Connection',
      type: 'sqlite',
      host: dbFilePath,
      port: 0,
      username: dbUsername,
      password: rememberPassword ? dbPassword : undefined,
      settingsPath: settingsPath || undefined,
      autoConnect,
      encrypted: isEncrypted,
      encryptPassword: isEncrypted && saveEncryptPassword ? encryptPassword : undefined,
      attachedDatabases: attachedDbs.length > 0 ? attachedDbs : undefined,
      httpTunnel: useHttpTunnel ? {
        url: tunnelUrl,
        useBase64,
        auth: httpAuthTab === 'auth' ? {
          type: usePasswordAuth ? 'password' : 'certificate',
          username: usePasswordAuth ? httpUsername : undefined,
          password: usePasswordAuth && saveHttpPassword ? httpPassword : undefined,
          clientKey: useCertAuth ? clientKeyPath : undefined,
          clientCert: useCertAuth ? clientCertPath : undefined,
          caCert: useCertAuth ? caCertPath : undefined,
          passphrase: useCertAuth ? passphrase : undefined
        } : undefined
      } : undefined
    }
    onSave(conn)
  }

  const tabs = [
    { id: 'general' as const, label: t('connection.tabs.general') },
    { id: 'advanced' as const, label: t('connection.tabs.advanced') },
    { id: 'attached' as const, label: t('connection.tabs.attached') },
    { id: 'http' as const, label: t('connection.tabs.http') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[750px] h-[650px] bg-gray-50 dark:bg-gray-800 rounded shadow-xl border border-gray-300 dark:border-gray-600 flex flex-col">
        {/* Header */}
        <ConnectionDialogHeader
          title={`${t('connection.new')} (SQLite)`}
          onClose={onClose}
        />

        {/* Tabs */}
        <ConnectionDialogTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        />

        {/* Connection diagram */}
        <ConnectionDiagram
          leftLabel="Navicat"
          rightLabel={t('connection.database')}
          LeftIcon={CircleDot}
          RightIcon={Database}
        />

        {/* Content */}
        <ConnectionDialogContent className="min-h-[420px] max-h-[480px] overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  {t('connection.general.name')}:
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="请输入连接名"
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  {t('connection.type')}:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dbType"
                      checked={dbType === 'existing'}
                      onChange={() => setDbType('existing')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">现有的数据库文件</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dbType"
                      checked={dbType === 'new3'}
                      onChange={() => setDbType('new3')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">新建 SQLite 3</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dbType"
                      checked={dbType === 'new2'}
                      onChange={() => setDbType('new2')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">新建 SQLite 2</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  {t('connection.database')}:
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={dbFilePath}
                  onChange={(e) => setDbFilePath(e.target.value)}
                  placeholder={dbType === 'existing' ? '选择或输入数据库文件路径' : '新数据库文件保存路径'}
                />
                <button
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  onClick={() => handleBrowseFile('db')}
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  {t('connection.general.username')}:
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={dbUsername}
                  onChange={(e) => setDbUsername(e.target.value)}
                  placeholder="可选"
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  {t('connection.general.password')}:
                </label>
                <input
                  type="password"
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder="可选，如果数据库已加密"
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('connection.general.remember')}</span>
                </label>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  提示：如果文件不存在，连接时将自动创建新的数据库文件
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                  设置位置:
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  value={settingsPath}
                  onChange={(e) => setSettingsPath(e.target.value)}
                  placeholder="SQLite 配置文件路径"
                />
                <button
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  onClick={() => handleBrowseFile('settings')}
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConnect}
                    onChange={(e) => setAutoConnect(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">自动连接</span>
                </label>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEncrypted}
                    onChange={(e) => setIsEncrypted(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">已加密</span>
                </label>
              </div>

              {isEncrypted && (
                <>
                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                      密码:
                    </label>
                    <input
                      type="password"
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={encryptPassword}
                      onChange={(e) => setEncryptPassword(e.target.value)}
                      placeholder="数据库加密密码"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveEncryptPassword}
                        onChange={(e) => setSaveEncryptPassword(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('connection.general.remember')}</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Attached Databases Tab */}
          {activeTab === 'attached' && (
            <div className="space-y-3">
              <div className="border border-gray-300 dark:border-gray-600 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal">名</th>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal">文件</th>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal">已加密</th>
                      <th className="text-left px-3 py-2 text-gray-700 dark:text-gray-300 font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody className="h-64 overflow-auto">
                    {attachedDbs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-400 dark:text-gray-500">
                          暂无附加数据库
                        </td>
                      </tr>
                    ) : (
                      attachedDbs.map((db) => (
                        <tr key={db.id} className="border-t border-gray-200 dark:border-gray-600">
                          <td className="px-3 py-2">
                            <input
                              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              value={db.name}
                              onChange={(e) => handleUpdateAttachedDb(db.id, { name: e.target.value })}
                              placeholder="数据库别名"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                value={db.file}
                                onChange={(e) => handleUpdateAttachedDb(db.id, { file: e.target.value })}
                                placeholder="数据库文件路径"
                              />
                              <button
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                onClick={() => handleBrowseFile('db')}
                              >
                                <FolderOpen className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={db.encrypted}
                              onChange={(e) => handleUpdateAttachedDb(db.id, { encrypted: e.target.checked })}
                              className="accent-blue-600"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                              onClick={() => handleRemoveAttachedDb(db.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1"
                  onClick={handleAddAttachedDb}
                >
                  <Plus className="w-4 h-4" />
                  附加数据库
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1 disabled:opacity-50"
                  onClick={() => setAttachedDbs([])}
                  disabled={attachedDbs.length === 0}
                >
                  <Minus className="w-4 h-4" />
                  分离数据库
                </button>
              </div>
            </div>
          )}

          {/* HTTP Tab */}
          {activeTab === 'http' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useHttpTunnel}
                  onChange={(e) => setUseHttpTunnel(e.target.checked)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">使用 HTTP 隧道</span>
              </label>

              {useHttpTunnel && (
                <>
                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                      隧道网址:
                    </label>
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={tunnelUrl}
                      onChange={(e) => setTunnelUrl(e.target.value)}
                      placeholder="http://example.com/tunnel.php"
                    />
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useBase64}
                        onChange={(e) => setUseBase64(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">用 base64 编码传出查询</span>
                    </label>
                  </div>

                  {/* HTTP sub-tabs */}
                  <div className="mt-4">
                    <div className="flex gap-1 border-b border-gray-300 dark:border-gray-600 mb-3">
                      <button
                        onClick={() => setHttpAuthTab('auth')}
                        className={`px-3 py-1 text-sm border border-b-0 rounded-t ${
                          httpAuthTab === 'auth'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 -mb-px'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent'
                        }`}
                      >
                        验证
                      </button>
                      <button
                        onClick={() => setHttpAuthTab('proxy')}
                        className={`px-3 py-1 text-sm border border-b-0 rounded-t ${
                          httpAuthTab === 'proxy'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 -mb-px'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent'
                        }`}
                      >
                        代理服务器
                      </button>
                    </div>

                    {httpAuthTab === 'auth' && (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={usePasswordAuth}
                            onChange={(e) => setUsePasswordAuth(e.target.checked)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">使用密码验证</span>
                        </label>

                        {usePasswordAuth && (
                          <>
                            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                用户名:
                              </label>
                              <input
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={httpUsername}
                                onChange={(e) => setHttpUsername(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                密码:
                              </label>
                              <input
                                type="password"
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={httpPassword}
                                onChange={(e) => setHttpPassword(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300" />
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={saveHttpPassword}
                                  onChange={(e) => setSaveHttpPassword(e.target.checked)}
                                  className="accent-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{t('connection.general.remember')}</span>
                              </label>
                            </div>
                          </>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer mt-4">
                          <input
                            type="checkbox"
                            checked={useCertAuth}
                            onChange={(e) => setUseCertAuth(e.target.checked)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">使用证书验证</span>
                        </label>

                        {useCertAuth && (
                          <div className="space-y-3 mt-3">
                            <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                客户端密钥:
                              </label>
                              <input
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={clientKeyPath}
                                onChange={(e) => setClientKeyPath(e.target.value)}
                                readOnly
                              />
                              <button
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                                onClick={() => handleBrowseFile('key')}
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                客户端证书:
                              </label>
                              <input
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={clientCertPath}
                                onChange={(e) => setClientCertPath(e.target.value)}
                                readOnly
                              />
                              <button
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                                onClick={() => handleBrowseFile('cert')}
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                CA 证书:
                              </label>
                              <input
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={caCertPath}
                                onChange={(e) => setCaCertPath(e.target.value)}
                                readOnly
                              />
                              <button
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                                onClick={() => handleBrowseFile('ca')}
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                              <label className="text-right text-sm text-gray-700 dark:text-gray-300">
                                通行短语:
                              </label>
                              <input
                                type="password"
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {httpAuthTab === 'proxy' && (
                      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        代理服务器配置即将推出
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </ConnectionDialogContent>

        {/* Footer */}
        <ConnectionDialogFooter
          onTest={testConnection}
          onSave={save}
          onCancel={onClose}
          testing={testing}
          testMessage={testMsg}
          t={t}
        />
      </div>
    </div>
  )
}
