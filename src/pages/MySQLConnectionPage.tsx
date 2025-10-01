import { useState, useEffect } from 'react'
import MySQLConnectionDialog from '../components/MySQLConnectionDialog'
import { Connection } from '../types'

export default function MySQLConnectionPage() {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    // Listen for dialog close request
    const handleBeforeUnload = () => {
      window.electronAPI?.mysqlDialog?.close()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleSave = (connection: Connection) => {
    window.electronAPI?.mysqlDialog?.save(connection)
    setOpen(false)
  }

  const handleClose = () => {
    window.electronAPI?.mysqlDialog?.close()
    setOpen(false)
  }

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900">
      <MySQLConnectionDialog
        open={open}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  )
}
