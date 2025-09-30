import { contextBridge, ipcRenderer } from 'electron'

export interface DatabaseAPI {
  connect: (config: any) => Promise<any>
  disconnect: (connectionId: string) => Promise<any>
  query: (connectionId: string, query: string) => Promise<any>
  getDatabases: (connectionId: string) => Promise<any>
  getTables: (connectionId: string, database: string) => Promise<any>
  getTableData: (connectionId: string, database: string, table: string, limit?: number, offset?: number) => Promise<any>
  getTablesInfo: (connectionId: string, database: string) => Promise<any>
  getTableSchema: (connectionId: string, database: string, table: string) => Promise<any>
}

export interface ElectronAPI {
  database: DatabaseAPI
  onMenuAction: (callback: (action: string) => void) => void
}

const electronAPI: ElectronAPI = {
  database: {
    connect: (config: any) => ipcRenderer.invoke('db:connect', config),
    disconnect: (connectionId: string) => ipcRenderer.invoke('db:disconnect', connectionId),
    query: (connectionId: string, query: string) => ipcRenderer.invoke('db:query', connectionId, query),
    getDatabases: (connectionId: string) => ipcRenderer.invoke('db:getDatabases', connectionId),
    getTables: (connectionId: string, database: string) => ipcRenderer.invoke('db:getTables', connectionId, database),
    getTableData: (connectionId: string, database: string, table: string, limit?: number, offset?: number) =>
      ipcRenderer.invoke('db:getTableData', connectionId, database, table, limit, offset)
    ,
    getTablesInfo: (connectionId: string, database: string) => ipcRenderer.invoke('db:getTablesInfo', connectionId, database),
    getTableSchema: (connectionId: string, database: string, table: string) =>
      ipcRenderer.invoke('db:getTableSchema', connectionId, database, table)
  },
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu:new-connection', () => callback('new-connection'))
    ipcRenderer.on('menu:about', () => callback('about'))
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
