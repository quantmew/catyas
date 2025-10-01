const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // Database operations
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  getDatabases: (config) => ipcRenderer.invoke('db:get-databases', config),
  getTables: (config, database) => ipcRenderer.invoke('db:get-tables', config, database),
  getViews: (config, database) => ipcRenderer.invoke('db:get-views', config, database),
  executeQuery: (config, query) => ipcRenderer.invoke('db:execute-query', config, query),
  getTableStructure: (config, tableName) => ipcRenderer.invoke('db:get-table-structure', config, tableName),
  getTableData: (config, tableName, limit, offset) => ipcRenderer.invoke('db:get-table-data', config, tableName, limit, offset),

  // Connection management
  saveConnection: (config) => ipcRenderer.invoke('connection:save', config),
  getConnections: () => ipcRenderer.invoke('connection:get-all'),
  deleteConnection: (id) => ipcRenderer.invoke('connection:delete', id),
})
