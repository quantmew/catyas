import { useState } from 'react'
import Titlebar from './components/Titlebar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import TopRibbon from './components/TopRibbon'
import MySQLConnectionDialog from './components/MySQLConnectionDialog'
import { Connection } from './types'

function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showMySQLDialog, setShowMySQLDialog] = useState(false)

  const handleSaveConnection = (conn: Connection) => {
    setConnections(prev => [...prev, conn])
    setSelectedConnection(conn)
    setShowMySQLDialog(false)
  }

  const handleOpenMySQLDialog = () => {
    setShowMySQLDialog(true)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Titlebar />
      <div className="flex flex-col flex-1 min-h-0" style={{ marginTop: '32px' }}>
        <TopRibbon onNewConnection={(dbType: string) => {
          if (dbType === 'mysql') {
            handleOpenMySQLDialog()
          }
        }} />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            connections={connections}
            selectedConnection={selectedConnection}
            onSelectConnection={setSelectedConnection}
            onAddConnection={handleOpenMySQLDialog}
          />
          <MainContent
            connection={selectedConnection}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
          />
        </div>
      </div>

      <MySQLConnectionDialog
        open={showMySQLDialog}
        onClose={() => setShowMySQLDialog(false)}
        onSave={handleSaveConnection}
      />
    </div>
  )
}

export default App
