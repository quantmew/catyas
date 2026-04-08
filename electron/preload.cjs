const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // Database operations
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  getDatabases: (config) => ipcRenderer.invoke('db:get-databases', config),
  getTables: (config, database) => ipcRenderer.invoke('db:get-tables', config, database),
  getViews: (config, database) => ipcRenderer.invoke('db:get-views', config, database),
  executeQuery: (config, query, database) => ipcRenderer.invoke('db:execute-query', config, query, database),
  getTableStructure: (config, database, tableName) => ipcRenderer.invoke('db:get-table-structure', config, database, tableName),
  getTableData: (config, database, tableName, limit, offset) => ipcRenderer.invoke('db:get-table-data', config, database, tableName, limit, offset),
  getTableInfo: (config, database, tableName) => ipcRenderer.invoke('db:get-table-info', config, database, tableName),

  // Connection management
  saveConnection: (config) => ipcRenderer.invoke('connection:save', config),
  getConnections: () => ipcRenderer.invoke('connection:get-all'),
  deleteConnection: (id) => ipcRenderer.invoke('connection:delete', id),

  // File dialog
  openFileDialog: (options) => ipcRenderer.invoke('dialog:open-file', options),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:save-file', options),
  openDirectoryDialog: (options) => ipcRenderer.invoke('dialog:open-directory', options),
  createSqliteDatabase: (filePath) => ipcRenderer.invoke('sqlite:create-database', filePath),

  // Window control
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('window:alwaysOnTop', alwaysOnTop),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // External shell
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),

  // App info
  getAppInfo: () => ipcRenderer.invoke('app:about'),
})
