import { useState, useEffect, useCallback } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Connection, Column } from '../types'
import { Play, Plus, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface TableViewProps {
  connection: Connection
  database: string
  tableName: string
}

export default function TableView({ connection, database, tableName }: TableViewProps) {
  const [activeTab, setActiveTab] = useState('data')

  // Data tab state
  const [data, setData] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  // Structure tab state
  const [structure, setStructure] = useState<Column[]>([])
  const [structureLoading, setStructureLoading] = useState(false)
  const [structureError, setStructureError] = useState<string | null>(null)

  // Query tab state
  const [queryText, setQueryText] = useState('')
  const [queryResult, setQueryResult] = useState<any[] | null>(null)
  const [queryColumns, setQueryColumns] = useState<string[]>([])
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)

  const loadTableData = useCallback(async () => {
    if (!window.electronAPI) return
    setDataLoading(true)
    setDataError(null)
    try {
      const result = await window.electronAPI.getTableData(connection, database, tableName, 1000, 0)
      if (result.success) {
        setData(result.data || [])
      } else {
        setDataError(result.message || 'Failed to load table data')
      }
    } catch (err: any) {
      setDataError(err.message || 'Unknown error')
    } finally {
      setDataLoading(false)
    }
  }, [connection, database, tableName])

  const loadTableStructure = useCallback(async () => {
    if (!window.electronAPI) return
    setStructureLoading(true)
    setStructureError(null)
    try {
      const result = await window.electronAPI.getTableStructure(connection, database, tableName)
      if (result.success) {
        setStructure((result.structure || []).map((col: any) => ({
          name: col.Field || col.COLUMN_NAME,
          type: col.Type || col.COLUMN_TYPE,
          nullable: (col.Null || col.IS_NULLABLE) === 'YES',
          defaultValue: col.Default ?? col.COLUMN_DEFAULT,
          key: col.Key || col.COLUMN_KEY || undefined,
          extra: col.Extra || col.EXTRA || undefined,
        })))
      } else {
        setStructureError(result.message || 'Failed to load table structure')
      }
    } catch (err: any) {
      setStructureError(err.message || 'Unknown error')
    } finally {
      setStructureLoading(false)
    }
  }, [connection, database, tableName])

  // Load data when table changes
  useEffect(() => {
    loadTableData()
  }, [loadTableData])

  // Load structure when structure tab is activated
  useEffect(() => {
    if (activeTab === 'structure' && structure.length === 0) {
      loadTableStructure()
    }
  }, [activeTab, structure.length, loadTableStructure])

  const handleRunQuery = async () => {
    if (!window.electronAPI || !queryText.trim()) return
    setQueryLoading(true)
    setQueryError(null)
    setQueryResult(null)
    try {
      const result = await window.electronAPI.executeQuery(connection, queryText, database)
      if (result.success) {
        const rows = result.data || []
        setQueryResult(rows)
        setQueryColumns(rows.length > 0 ? Object.keys(rows[0]) : [])
      } else {
        setQueryError(result.message || 'Query failed')
      }
    } catch (err: any) {
      setQueryError(err.message || 'Unknown error')
    } finally {
      setQueryLoading(false)
    }
  }

  // Derive columns from data
  const dataColumns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
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
        <button
          onClick={loadTableData}
          disabled={dataLoading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
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

        {/* Data Tab */}
        <Tabs.Content value="data" className="flex-1 overflow-auto">
          {dataLoading && data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : dataError ? (
            <div className="flex items-center gap-2 p-4 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{dataError}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              Table is empty
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="w-10 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                      <input type="checkbox" className="rounded" />
                    </th>
                    {dataColumns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-600 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="rounded" />
                      </td>
                      {dataColumns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2 text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-600 whitespace-nowrap max-w-xs truncate"
                        >
                          {row[col] === null ? <span className="text-gray-400 italic">NULL</span> : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tabs.Content>

        {/* Structure Tab */}
        <Tabs.Content value="structure" className="flex-1 overflow-auto">
          {structureLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : structureError ? (
            <div className="flex items-center gap-2 p-4 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{structureError}</span>
            </div>
          ) : structure.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">Null</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">Key</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">Default</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Extra</th>
                  </tr>
                </thead>
                <tbody>
                  {structure.map((col) => (
                    <tr
                      key={col.name}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 font-medium">{col.name}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 font-mono text-xs">{col.type}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">{col.nullable ? 'YES' : 'NO'}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        {col.key ? (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            col.key === 'PRI' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            col.key === 'UNI' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>{col.key}</span>
                        ) : ''}
                      </td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 font-mono text-xs">
                        {col.defaultValue === null ? <span className="text-gray-400 italic">NULL</span> : String(col.defaultValue)}
                      </td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 text-xs">{col.extra || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              No structure data available
            </div>
          )}
        </Tabs.Content>

        {/* Query Tab */}
        <Tabs.Content value="query" className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={`SELECT * FROM ${tableName};`}
            />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
            <button
              onClick={handleRunQuery}
              disabled={queryLoading || !queryText.trim()}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
            >
              {queryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Query
            </button>
            {queryError && (
              <span className="text-sm text-red-600 dark:text-red-400">{queryError}</span>
            )}
          </div>
          {/* Query Results */}
          {queryResult !== null && (
            <div className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {queryColumns.map((col) => (
                      <th key={col} className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {queryColumns.map((col) => (
                        <td key={col} className="px-4 py-2 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap max-w-xs truncate">
                          {row[col] === null ? <span className="text-gray-400 italic">NULL</span> : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {/* Status Bar */}
      <div className="h-8 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <span>{dataLoading ? 'Loading...' : `${data.length} rows`}</span>
        {dataColumns.length > 0 && <span className="ml-4">{dataColumns.length} columns</span>}
      </div>
    </div>
  )
}
