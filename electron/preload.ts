import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // Database operations
  testConnection: (config: any) => ipcRenderer.invoke('db:test-connection', config),
  executeQuery: (config: any, query: string) => ipcRenderer.invoke('db:execute-query', config, query),
  getTables: (config: any) => ipcRenderer.invoke('db:get-tables', config),
  getTableStructure: (config: any, tableName: string) => ipcRenderer.invoke('db:get-table-structure', config, tableName),
  getTableData: (config: any, tableName: string, limit: number, offset: number) => ipcRenderer.invoke('db:get-table-data', config, tableName, limit, offset),

  // Connection management
  saveConnection: (config: any) => ipcRenderer.invoke('connection:save', config),
  getConnections: () => ipcRenderer.invoke('connection:get-all'),
  deleteConnection: (id: string) => ipcRenderer.invoke('connection:delete', id),

  // Window controls
  windowControl: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
})
