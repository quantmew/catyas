import { Database, Plus, ChevronRight, ChevronDown, Folder, Table2, Layers, Trash2 } from 'lucide-react'
import { Connection } from '../types'
import { useTranslation } from 'react-i18next'
import * as ContextMenu from '@radix-ui/react-context-menu'

interface SidebarProps {
  connections: Connection[]
  selectedConnection: Connection | null
  onSelectConnection: (connection: Connection) => void
  onAddConnection: () => void
  onToggleDatabase: (connectionId: string, databaseName: string) => void
  onSelectTable: (connectionId: string, databaseName: string, tableName: string) => void
  onDeleteConnection?: (connectionId: string) => void
}

export default function Sidebar({
  connections,
  selectedConnection,
  onSelectConnection,
  onAddConnection,
  onToggleDatabase,
  onSelectTable,
  onDeleteConnection,
}: SidebarProps) {
  const { t } = useTranslation()

  const getDatabaseIcon = (_type: string) => {
    return <Database className="w-4 h-4" />
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-200">{t('sidebar.connections')}</h2>
        <button
          onClick={onAddConnection}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={t('sidebar.addConnection')}
        >
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('sidebar.noConnections')}<br />
            {t('sidebar.clickToAdd')}
          </div>
        ) : (
          <div className="py-2">
            {connections.map((connection) => (
              <div key={connection.id}>
                {/* Connection Level */}
                <ContextMenu.Root>
                  <ContextMenu.Trigger asChild>
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
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content
                      className="min-w-[160px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 rounded z-50"
                    >
                      <ContextMenu.Item
                        className="outline-none px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-default flex items-center gap-2"
                        onSelect={() => {
                          if (confirm(t('sidebar.confirmDelete'))) {
                            onDeleteConnection?.(connection.id)
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('sidebar.deleteConnection')}
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Portal>
                </ContextMenu.Root>

                {/* Databases Level */}
                {connection.expanded && connection.databases && (
                  <div className="pl-4">
                    {connection.databases.map((db) => {
                      return (
                        <div key={`${connection.id}-${db.name}`}>
                          <div
                            className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleDatabase(connection.id, db.name)
                            }}
                          >
                            {db.expanded ? (
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
                          {db.expanded && (db.tables || (db as any).views) && (
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
