import { useState } from 'react'
import Titlebar from './components/Titlebar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import TopRibbon from './components/TopRibbon'
import MySQLConnectionDialog from './components/MySQLConnectionDialog'
import PostgreSQLConnectionDialog from './components/PostgreSQLConnectionDialog'
import OracleConnectionDialog from './components/OracleConnectionDialog'
import SQLiteConnectionDialog from './components/SQLiteConnectionDialog'
import SQLServerConnectionDialog from './components/SQLServerConnectionDialog'
import MariaDBConnectionDialog from './components/MariaDBConnectionDialog'
import MongoDBConnectionDialog from './components/MongoDBConnectionDialog'
import RedisConnectionDialog from './components/RedisConnectionDialog'
import OptionsDialog from './components/OptionsDialog'
import DataTransferWizard from './components/DataTransferWizard/index'
import { Connection, Database } from './types'

type DatabaseType = 'mysql' | 'postgresql' | 'oracle' | 'sqlite' | 'sqlserver' | 'mariadb' | 'mongodb' | 'redis' | null

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      testConnection: (config: any) => Promise<{ success: boolean; message: string }>
      getDatabases: (config: any) => Promise<{ success: boolean; databases?: any[]; message?: string }>
      getTables: (config: any, database: string) => Promise<{ success: boolean; tables?: any[]; message?: string }>
      getViews: (config: any, database: string) => Promise<{ success: boolean; views?: any[]; message?: string }>
      getViews: (config: any, database: string) => Promise<{ success: boolean; views?: any[]; message?: string }>
      executeQuery: (config: any, query: string) => Promise<{ success: boolean; data?: any[]; message?: string }>
      getTableStructure: (config: any, tableName: string) => Promise<{ success: boolean; structure?: any[]; message?: string }>
      getTableData: (config: any, tableName: string, limit: number, offset: number) => Promise<{ success: boolean; data?: any[]; message?: string }>
    }
  }
}

function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeDialog, setActiveDialog] = useState<DatabaseType>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(260)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300)

  const handleSaveConnection = async (conn: Connection) => {
    // Fetch databases for MySQL/MariaDB (only in Electron mode)
    if ((conn.type === 'mysql' || conn.type === 'mariadb') && window.electronAPI) {
      try {
        const result = await window.electronAPI.getDatabases(conn)
        if (result?.success && result.databases) {
          conn.databases = result.databases.map((db: any) => ({
            name: db.Database || db.SCHEMA_NAME || Object.values(db)[0],
            tables: [],
            expanded: false
          }))
          conn.expanded = true
        }
      } catch (error) {
        console.error('Failed to fetch databases:', error)
      }
    } else if (!window.electronAPI) {
      // Web mode: add mock databases for demonstration
      conn.databases = [
        { name: 'test_db', tables: [], expanded: false },
        { name: 'demo_db', tables: [], expanded: false }
      ]
      conn.expanded = true
    }

    setConnections(prev => [...prev, conn])
    setSelectedConnection(conn)
    setActiveDialog(null)
  }

  const handleSelectConnection = async (conn: Connection) => {
    setSelectedConnection(conn)

    // Toggle expansion and load databases if not already loaded
    const updatedConnections = connections.map(c => {
      if (c.id === conn.id) {
        const newExpanded = !c.expanded

        // Load databases on first expansion if MySQL/MariaDB (Electron mode)
        if (newExpanded && !c.databases && (c.type === 'mysql' || c.type === 'mariadb') && window.electronAPI) {
          window.electronAPI.getDatabases(c).then(result => {
            if (result?.success && result.databases) {
              setConnections(prev => prev.map(prevConn => {
                if (prevConn.id === c.id) {
                  return {
                    ...prevConn,
                    databases: result.databases.map((db: any) => ({
                      name: db.Database || db.SCHEMA_NAME || Object.values(db)[0],
                      tables: [],
                      expanded: false
                    })),
                    expanded: true
                  }
                }
                return prevConn
              }))
            }
          })
        }

        return { ...c, expanded: newExpanded }
      }
      return c
    })

    setConnections(updatedConnections)
  }

  const handleToggleDatabase = async (connectionId: string, databaseName: string) => {
    const connection = connections.find(c => c.id === connectionId)
    if (!connection) return

    setConnections(prev => prev.map(conn => {
      if (conn.id === connectionId && conn.databases) {
        return {
          ...conn,
          databases: conn.databases.map(db => {
            if (db.name === databaseName) {
              const newExpanded = !db.expanded

              // Load tables/views on first expansion (Electron mode)
              if (newExpanded && !db.tables?.length && window.electronAPI) {
                window.electronAPI.getTables(connection, databaseName).then(result => {
                  if (result?.success && result.tables) {
                    setConnections(prev2 => prev2.map(c => {
                      if (c.id === connectionId && c.databases) {
                        return {
                          ...c,
                          databases: c.databases.map(d => {
                            if (d.name === databaseName) {
                              return {
                                ...d,
                                tables: result.tables.map((t: any) => ({
                                  name: Object.values(t)[0] as string,
                                  type: 'table' as const
                                })),
                                expanded: true
                              }
                            }
                            return d
                          })
                        }
                      }
                      return c
                    }))
                  }
                })
                // Fetch views as well (Electron mode)
                if (window.electronAPI) {
                  window.electronAPI.getViews(connection, databaseName).then(result => {
                  if (result?.success && result.views) {
                    setConnections(prev2 => prev2.map(c => {
                      if (c.id === connectionId && c.databases) {
                        return {
                          ...c,
                          databases: c.databases.map(d => {
                            if (d.name === databaseName) {
                              return {
                                ...d,
                                ...(d as any),
                                views: result.views.map((v: any) => ({
                                  name: v.TABLE_NAME || Object.values(v)[0],
                                  type: 'view' as const
                                })),
                                expanded: true
                              }
                            }
                            return d
                          })
                        }
                      }
                      return c
                    }))
                  }
                  })
                }
              } else if (newExpanded && !db.tables?.length && !window.electronAPI) {
                // Web mode: add mock tables for demonstration
                setConnections(prev2 => prev2.map(c => {
                  if (c.id === connectionId && c.databases) {
                    return {
                      ...c,
                      databases: c.databases.map(d => {
                        if (d.name === databaseName) {
                          return {
                            ...d,
                            tables: [
                              { name: 'users', type: 'table' as const },
                              { name: 'orders', type: 'table' as const },
                              { name: 'products', type: 'table' as const }
                            ],
                            views: [
                              { name: 'user_stats' },
                              { name: 'order_summary' }
                            ],
                            expanded: true
                          }
                        }
                        return d
                      })
                    }
                  }
                  return c
                }))
              }

              return { ...db, expanded: newExpanded }
            }
            return db
          })
        }
      }
      return conn
    }))
  }

  const handleSelectTable = (connectionId: string, databaseName: string, tableName: string) => {
    console.log('Selected table:', connectionId, databaseName, tableName)
    setSelectedTable(tableName)
    // TODO: Load table data
  }

  const handleCloseDialog = () => {
    setActiveDialog(null)
  }

  const handleLeftResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = leftSidebarWidth

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(200, Math.min(600, startWidth + diff))
      setLeftSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleRightResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = rightSidebarWidth

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startX - e.clientX
      const newWidth = Math.max(250, Math.min(600, startWidth + diff))
      setRightSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  // Listen for Tools->Options menu
  window.addEventListener('open-options-dialog', () => setOptionsOpen(true))

  // Listen for Tools->Data Transfer menu
  window.addEventListener('open-data-transfer-dialog', () => setTransferOpen(true))

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Titlebar />
      <div className="flex flex-col flex-1 min-h-0" style={{ marginTop: window.electronAPI ? '32px' : '0' }}>
        <TopRibbon onNewConnection={(dbType: string) => {
          setActiveDialog(dbType as DatabaseType)
        }} />
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div className="flex" style={{ width: leftSidebarWidth }}>
            <Sidebar
              connections={connections}
              selectedConnection={selectedConnection}
              onSelectConnection={handleSelectConnection}
              onAddConnection={() => setActiveDialog('mysql')}
              onToggleDatabase={handleToggleDatabase}
              onSelectTable={handleSelectTable}
            />
            {/* Resize Handle */}
            <div
              className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-col-resize transition-colors"
              onMouseDown={handleLeftResize}
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 min-w-0">
            <MainContent
              connection={selectedConnection}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
            />
          </div>

          {/* Right Sidebar */}
          <div className="flex" style={{ width: rightSidebarWidth }}>
            {/* Resize Handle */}
            <div
              className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-col-resize transition-colors"
              onMouseDown={handleRightResize}
            />
            <div className="flex-1 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">信息</h3>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTable ? (
                      <div>
                        <p className="font-medium mb-2">表信息</p>
                        <p>表名: {selectedTable}</p>
                      </div>
                    ) : (
                      <p>请选择一个表</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MySQLConnectionDialog
        open={activeDialog === 'mysql'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <PostgreSQLConnectionDialog
        open={activeDialog === 'postgresql'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <OracleConnectionDialog
        open={activeDialog === 'oracle'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <SQLiteConnectionDialog
        open={activeDialog === 'sqlite'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <SQLServerConnectionDialog
        open={activeDialog === 'sqlserver'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <MariaDBConnectionDialog
        open={activeDialog === 'mariadb'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <MongoDBConnectionDialog
        open={activeDialog === 'mongodb'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />
      <RedisConnectionDialog
        open={activeDialog === 'redis'}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
      />

      {/* 暂未接入按钮入口，这里先保留组件，后续接入菜单/工具栏 */}
      <DataTransferWizard open={transferOpen} onClose={()=>setTransferOpen(false)} connections={connections} />
      <OptionsDialog open={optionsOpen} onClose={()=>setOptionsOpen(false)} />
    </div>
  )
}

export default App
