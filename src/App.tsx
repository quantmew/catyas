import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import { Connection } from './types'

function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        connections={connections}
        selectedConnection={selectedConnection}
        onSelectConnection={setSelectedConnection}
        onAddConnection={() => {/* TODO: implement */}}
      />
      <MainContent
        connection={selectedConnection}
        selectedTable={selectedTable}
        onSelectTable={setSelectedTable}
      />
    </div>
  )
}

export default App