import { Table2, Search } from 'lucide-react'
import { Table } from '../types'
import { useState } from 'react'

interface TableListProps {
  databaseName: string
  tables: Table[]
  selectedTable: string | null
  onSelectTable: (table: string) => void
}

export default function TableList({
  databaseName,
  tables,
  selectedTable,
  onSelectTable,
}: TableListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 truncate">
          {databaseName}
        </h3>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {filteredTables.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">
              {tables.length === 0 ? 'No tables loaded' : 'No matching tables'}
            </div>
          ) : (
            filteredTables.map((table) => (
              <div
                key={table.name}
                className={`
                  flex items-center gap-2 px-4 py-2 cursor-pointer
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${selectedTable === table.name ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''}
                `}
                onClick={() => onSelectTable(table.name)}
              >
                <Table2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {table.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
