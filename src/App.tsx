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

  const handleSaveConnection = async (conn: Connection) => {
    // Fetch databases for MySQL/MariaDB
    if (conn.type === 'mysql' || conn.type === 'mariadb') {
      try {
        const result = await window.electronAPI?.getDatabases(conn)
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

        // Load databases on first expansion if MySQL/MariaDB
        if (newExpanded && !c.databases && (c.type === 'mysql' || c.type === 'mariadb')) {
          window.electronAPI?.getDatabases(c).then(result => {
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

              // Load tables/views on first expansion
              if (newExpanded && !db.tables?.length) {
                window.electronAPI?.getTables(connection, databaseName).then(result => {
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
                // Fetch views as well
                window.electronAPI?.getViews(connection, databaseName).then(result => {
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Titlebar />
      <div className="flex flex-col flex-1 min-h-0" style={{ marginTop: '32px' }}>
        <TopRibbon onNewConnection={(dbType: string) => {
          setActiveDialog(dbType as DatabaseType)
        }} />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            connections={connections}
            selectedConnection={selectedConnection}
            onSelectConnection={handleSelectConnection}
            onAddConnection={() => setActiveDialog('mysql')}
            onToggleDatabase={handleToggleDatabase}
            onSelectTable={handleSelectTable}
          />
          <MainContent
            connection={selectedConnection}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
          />
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
    </div>
  )
}

export default App
