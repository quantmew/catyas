import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Connection } from '../types'
import { Play, Plus, Trash2 } from 'lucide-react'

interface TableViewProps {
  connection: Connection
  tableName: string
}

export default function TableView({ connection, tableName }: TableViewProps) {
  const [activeTab, setActiveTab] = useState('data')

  // Mock data
  const columns = ['id', 'name', 'email', 'created_at']
  const rows = [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 px-4">
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
          <Plus className="w-4 h-4" />
          New Row
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
          <Play className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <Tabs.Trigger
            value="data"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors"
          >
            Data
          </Tabs.Trigger>
          <Tabs.Trigger
            value="structure"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors"
          >
            Structure
          </Tabs.Trigger>
          <Tabs.Trigger
            value="query"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors"
          >
            Query
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="data" className="flex-1 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="w-10 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="rounded" />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-2">
                      <input type="checkbox" className="rounded" />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2 text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-600"
                      >
                        {row[col as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="structure" className="flex-1 overflow-auto p-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Table structure view coming soon...
          </div>
        </Tabs.Content>

        <Tabs.Content value="query" className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`SELECT * FROM ${tableName};`}
            />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <button className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
              Run Query
            </button>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Status Bar */}
      <div className="h-8 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <span>{rows.length} rows</span>
      </div>
    </div>
  )
}