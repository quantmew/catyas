import { Connection } from '../../types'

interface Props {
  label: string
  connections: Connection[]
  selectedConnId: string
  selectedDb: string
  onConnChange: (connId: string) => void
  onDbChange: (db: string) => void
  showConnectionInfo?: boolean
}

export default function ConnectionSelector({
  label,
  connections,
  selectedConnId,
  selectedDb,
  onConnChange,
  onDbChange,
  showConnectionInfo = true
}: Props) {
  const selectedConn = connections.find(c => c.id === selectedConnId) || null

  return (
    <div>
      {label ? (<div className="text-blue-600 font-semibold mb-2">{label}</div>) : null}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">连接:</div>
      <select
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
        value={selectedConnId}
        onChange={e => {
          onConnChange(e.target.value)
          onDbChange('')
        }}
      >
        <option value="">请选择连接</option>
        {connections.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-1">数据库:</div>
      <select
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
        value={selectedDb}
        onChange={e => onDbChange(e.target.value)}
        disabled={!selectedConnId}
      >
        <option value="">请选择数据库</option>
        {selectedConn?.databases?.map(db => (
          <option key={db.name} value={db.name}>
            {db.name}
          </option>
        ))}
      </select>

      {showConnectionInfo && (
        <>
          <div className="mt-6 text-sm font-medium text-gray-700 dark:text-gray-300">信息</div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-6">
            <div>连接类型: {selectedConn?.type?.toUpperCase() || '-'}</div>
            <div>连接名: {selectedConn?.name || '-'}</div>
            <div>主机: {selectedConn?.host || '-'}</div>
            <div>端口: {selectedConn?.port || '-'}</div>
          </div>
        </>
      )}
    </div>
  )
}
