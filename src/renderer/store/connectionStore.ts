import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Connection {
  id: string
  name: string
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb' | 'redis' | 'oracle' | 'sqlserver' | 'mariadb'
  config: any
  connected: boolean
  databases?: string[]
  tables?: { [database: string]: string[] }
}

interface ConnectionState {
  connections: Connection[]
  selectedConnection: string | null
  selectedDatabase: string | null
  selectedTable: string | null

  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  updateConnection: (id: string, updates: Partial<Connection>) => void
  setSelectedConnection: (id: string | null) => void
  setSelectedDatabase: (database: string | null) => void
  setSelectedTable: (table: string | null) => void

  loadDatabases: (connectionId: string) => Promise<void>
  loadTables: (connectionId: string, database: string) => Promise<void>
}

export const useConnectionStore = create<ConnectionState>()(
  devtools(
    (set, get) => ({
      connections: [],
      selectedConnection: null,
      selectedDatabase: null,
      selectedTable: null,

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          selectedConnection: state.selectedConnection === id ? null : state.selectedConnection,
        })),

      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
        })),

      setSelectedConnection: (id) =>
        set({
          selectedConnection: id,
          selectedDatabase: null,
          selectedTable: null,
        }),

      setSelectedDatabase: (database) =>
        set({
          selectedDatabase: database,
          selectedTable: null,
        }),

      setSelectedTable: (table) =>
        set({
          selectedTable: table,
        }),

      loadDatabases: async (connectionId) => {
        try {
          const result = await window.electronAPI.database.getDatabases(connectionId)
          if (result.success) {
            set((state) => ({
              connections: state.connections.map((conn) =>
                conn.id === connectionId
                  ? { ...conn, databases: result.data }
                  : conn
              ),
            }))
          }
        } catch (error) {
          console.error('Failed to load databases:', error)
        }
      },

      loadTables: async (connectionId, database) => {
        try {
          const result = await window.electronAPI.database.getTables(connectionId, database)
          if (result.success) {
            set((state) => ({
              connections: state.connections.map((conn) =>
                conn.id === connectionId
                  ? {
                      ...conn,
                      tables: {
                        ...conn.tables,
                        [database]: result.data,
                      },
                    }
                  : conn
              ),
            }))
          }
        } catch (error) {
          console.error('Failed to load tables:', error)
        }
      },
    }),
    {
      name: 'connection-store',
    }
  )
)