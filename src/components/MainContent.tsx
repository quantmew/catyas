import { Connection } from '../types'
import TabbedView from './TabbedView'

interface MainContentProps {
  connection: Connection | null
  selectedTable: string | null
  onSelectTable: (table: string) => void
}

export default function MainContent({
  connection,
  selectedTable,
}: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TabbedView selectedTable={selectedTable} connection={connection} />
    </div>
  )
}
