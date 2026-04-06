import { useState, useEffect } from 'react'
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
import { Connection } from './types'

type DatabaseType = 'mysql' | 'postgresql' | 'oracle' | 'sqlite' | 'sqlserver' | 'mariadb' | 'mongodb' | 'redis' | null

function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [activeDialog, setActiveDialog] = useState<DatabaseType>(null)
  const [optionsOpen, setOptionsOpen] = useState(false)

  // Load saved connections on mount
  useEffect(() => {
    window.electronAPI?.getConnections().then(result => {
      if (result?.success && result.connections) {
        setConnections(result.connections)
      }
    })
  }, [])

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

    // Persist connection (strip runtime state)
    const { databases, expanded, ...connConfig } = conn
    window.electronAPI?.saveConnection(connConfig as any)
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
            if (result?.success && result.databases != null) {
              setConnections(prev => prev.map(prevConn => {
                if (prevConn.id === c.id) {
                  return {
                    ...prevConn,
                    databases: result.databases!.map((db: any) => ({
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
                  if (result?.success && result.tables != null) {
                    setConnections(prev2 => prev2.map(c => {
                      if (c.id === connectionId && c.databases) {
                        return {
                          ...c,
                          databases: c.databases.map(d => {
                            if (d.name === databaseName) {
                              return {
                                ...d,
                                tables: result.tables!.map((t: any) => ({
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
                  if (result?.success && result.views != null) {
                    setConnections(prev2 => prev2.map(c => {
                      if (c.id === connectionId && c.databases) {
                        return {
                          ...c,
                          databases: c.databases.map(d => {
                            if (d.name === databaseName) {
                              return {
                                ...d,
                                ...(d as any),
                                views: result.views!.map((v: any) => ({
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

  const handleSelectTable = (_connectionId: string, databaseName: string, tableName: string) => {
    setSelectedTable(tableName)
    setSelectedDatabase(databaseName)
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
        }} onOpenOptions={() => setOptionsOpen(true)} />
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
            selectedDatabase={selectedDatabase}
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
      <OptionsDialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
      />
    </div>
  )
}

export default App
