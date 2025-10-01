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
import { Connection } from './types'

type DatabaseType = 'mysql' | 'postgresql' | 'oracle' | 'sqlite' | 'sqlserver' | 'mariadb' | 'mongodb' | 'redis' | null

function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeDialog, setActiveDialog] = useState<DatabaseType>(null)

  const handleSaveConnection = (conn: Connection) => {
    setConnections(prev => [...prev, conn])
    setSelectedConnection(conn)
    setActiveDialog(null)
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
            onSelectConnection={setSelectedConnection}
            onAddConnection={() => setActiveDialog('mysql')}
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
