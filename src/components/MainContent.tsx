import { Connection } from '../types'
import TableList from './TableList'
import TableView from './TableView'

interface MainContentProps {
  connection: Connection | null
  selectedTable: string | null
  onSelectTable: (table: string) => void
}

export default function MainContent({
  connection,
  selectedTable,
  onSelectTable,
}: MainContentProps) {
  if (!connection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
            Welcome to Catyas
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a connection from the sidebar to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      <TableList
        connection={connection}
        selectedTable={selectedTable}
        onSelectTable={onSelectTable}
      />
      {selectedTable ? (
        <TableView connection={connection} tableName={selectedTable} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Select a table to view its contents
          </p>
        </div>
      )}
    </div>
  )
}