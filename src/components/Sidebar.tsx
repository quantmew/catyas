import { Database, Plus, ChevronRight, ChevronDown, Folder, Table2, Layers } from 'lucide-react'
import { Connection } from '../types'
import { useState } from 'react'

interface SidebarProps {
  connections: Connection[]
  selectedConnection: Connection | null
  onSelectConnection: (connection: Connection) => void
  onAddConnection: () => void
  onToggleDatabase: (connectionId: string, databaseName: string) => void
  onSelectTable: (connectionId: string, databaseName: string, tableName: string) => void
}

export default function Sidebar({
  connections,
  selectedConnection,
  onSelectConnection,
  onAddConnection,
  onToggleDatabase,
  onSelectTable,
}: SidebarProps) {
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set())

  const toggleDatabase = (key: string) => {
    const newExpanded = new Set(expandedDatabases)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedDatabases(newExpanded)
  }

  const getDatabaseIcon = (_type: string) => {
    return <Database className="w-4 h-4" />
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Connections</h2>
        <button
          onClick={onAddConnection}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="New Connection"
        >
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No connections yet.<br />
            Click + to add one.
          </div>
        ) : (
          <div className="py-2">
            {connections.map((connection) => (
              <div key={connection.id}>
                {/* Connection Level */}
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${selectedConnection?.id === connection.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  onClick={() => {
                    onSelectConnection(connection)
                  }}
                >
                  {connection.expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {getDatabaseIcon(connection.type)}
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">
                    {connection.name}
                  </span>
                </div>

                {/* Databases Level */}
                {connection.expanded && connection.databases && (
                  <div className="pl-4">
                    {connection.databases.map((db) => {
                      const dbKey = `${connection.id}-${db.name}`
                      const isExpanded = expandedDatabases.has(dbKey)

                      return (
                        <div key={dbKey}>
                          <div
                            className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleDatabase(dbKey)
                              onToggleDatabase(connection.id, db.name)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                            )}
                            <Folder className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs text-gray-700 dark:text-gray-200">
                              {db.name}
                            </span>
                          </div>

                          {/* Tables & Views Level */}
                          {isExpanded && (db.tables || (db as any).views) && (
                            <div className="pl-4">
                              {db.tables?.map((table) => (
                                <div
                                  key={table.name}
                                  className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectTable(connection.id, db.name, table.name)
                                  }}
                                >
                                  <div className="w-3 h-3" />
                                  <Table2 className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {table.name}
                                  </span>
                                </div>
                              ))}
                              {(db as any).views?.map((view: any) => (
                                <div
                                  key={`view-${view.name}`}
                                  className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <div className="w-3 h-3" />
                                  <Layers className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {view.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
