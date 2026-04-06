import { Connection, Table } from '../types'
import TableList from './TableList'
import TableView from './TableView'
import RightInfo from './RightInfo'
import { useTranslation } from 'react-i18next'

interface MainContentProps {
  connection: Connection | null
  selectedTable: string | null
  selectedDatabase: string | null
}

export default function MainContent({
  connection,
  selectedTable,
  selectedDatabase,
}: MainContentProps) {
  const { t } = useTranslation()
  if (!connection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {t('welcome.title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('welcome.selectConnection')}
          </p>
        </div>
      </div>
    )
  }

  // Find the currently selected database and its tables
  const currentDb = connection.databases?.find(db => db.name === selectedDatabase)
  const tables: Table[] = currentDb?.tables || []

  return (
    <div className="flex-1 flex min-h-0">
      <TableList
        databaseName={selectedDatabase || connection.database || connection.name}
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={(_tableName) => {
          // Table click from TableList panel
        }}
      />
      {selectedTable && selectedDatabase ? (
        <TableView
          connection={connection}
          database={selectedDatabase}
          tableName={selectedTable}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            {t('welcome.selectTable')}
          </p>
        </div>
      )}
      <RightInfo
        connection={connection}
        database={selectedDatabase}
        tableName={selectedTable}
      />
    </div>
  )
}
