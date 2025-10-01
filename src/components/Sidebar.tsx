import { Database, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import { Connection } from '../types'
import { useState } from 'react'

interface SidebarProps {
  connections: Connection[]
  selectedConnection: Connection | null
  onSelectConnection: (connection: Connection) => void
  onAddConnection: () => void
}

export default function Sidebar({
  connections,
  selectedConnection,
  onSelectConnection,
  onAddConnection,
}: SidebarProps) {
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set())

  const toggleConnection = (id: string) => {
    const newExpanded = new Set(expandedConnections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedConnections(newExpanded)
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
                <div
                  className={`
                    flex items-center gap-2 px-3 py-2 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${selectedConnection?.id === connection.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  onClick={() => {
                    onSelectConnection(connection)
                    toggleConnection(connection.id)
                  }}
                >
                  {expandedConnections.has(connection.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {getDatabaseIcon(connection.type)}
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">
                    {connection.name}
                  </span>
                </div>
                {expandedConnections.has(connection.id) && (
                  <div className="pl-8 py-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                      {connection.host}:{connection.port}
                    </div>
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