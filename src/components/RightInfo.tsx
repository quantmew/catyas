import { useState, useEffect } from 'react'
import { Info, Loader2, Database, Server } from 'lucide-react'
import { Connection } from '../types'

interface RightInfoProps {
  connection: Connection | null
  database: string | null
  tableName: string | null
}

interface TableInfo {
  ENGINE?: string
  ROW_FORMAT?: string
  TABLE_ROWS?: number
  CREATE_TIME?: string
  UPDATE_TIME?: string
  TABLE_COLLATION?: string
}

export default function RightInfo({ connection, database, tableName }: RightInfoProps) {
  const [info, setInfo] = useState<TableInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!window.electronAPI || !connection || !database || !tableName) {
      setInfo(null)
      return
    }

    setLoading(true)
    window.electronAPI.getTableInfo(connection, database, tableName)
      .then(result => {
        if (result.success) {
          setInfo(result.info || null)
        } else {
          setInfo(null)
        }
      })
      .catch(() => setInfo(null))
      .finally(() => setLoading(false))
  }, [connection, database, tableName])

  // Show connection info when no table is selected
  if (!tableName && connection) {
    return (
      <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Connection Info</span>
        </div>
        <div className="p-4 text-xs text-gray-600 dark:text-gray-300 space-y-3">
          <div>
            <div className="text-gray-400">Name</div>
            <div className="font-medium text-gray-800 dark:text-gray-100">{connection.name}</div>
          </div>
          <div>
            <div className="text-gray-400">Type</div>
            <div className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              {connection.type.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Host</div>
            <div className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
              <Server className="w-3.5 h-3.5" />
              {connection.host}:{connection.port}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Username</div>
            <div className="font-medium text-gray-800 dark:text-gray-100">{connection.username}</div>
          </div>
          {database && (
            <div>
              <div className="text-gray-400">Database</div>
              <div className="font-medium text-gray-800 dark:text-gray-100">{database}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
        <Info className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Properties</span>
      </div>
      <div className="p-4 text-xs text-gray-600 dark:text-gray-300 space-y-2 overflow-auto">
        {!connection ? (
          <div className="text-gray-400">Select a connection or table to view info</div>
        ) : (
          <>
            <div>
              <div className="text-gray-400">Table</div>
              <div className="font-medium text-gray-800 dark:text-gray-100">{tableName || 'Not selected'}</div>
            </div>
            {database && (
              <div>
                <div className="text-gray-400">Database</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">{database}</div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : info ? (
              <>
                <div>
                  <div className="text-gray-400">Engine</div>
                  <div>{info.ENGINE || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Row Format</div>
                  <div>{info.ROW_FORMAT || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Row Count</div>
                  <div>{info.TABLE_ROWS != null ? info.TABLE_ROWS.toLocaleString() : 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Collation</div>
                  <div>{info.TABLE_COLLATION || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Created</div>
                  <div>{info.CREATE_TIME ? new Date(info.CREATE_TIME).toLocaleString() : 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Updated</div>
                  <div>{info.UPDATE_TIME ? new Date(info.UPDATE_TIME).toLocaleString() : 'N/A'}</div>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
