export interface ElectronAPI {
  // Platform info
  platform: NodeJS.Platform

  // Database operations
  testConnection: (config: any) => Promise<any>
  executeQuery: (config: any, query: string) => Promise<any>
  getTables: (config: any) => Promise<any>
  getTableStructure: (config: any, tableName: string) => Promise<any>
  getTableData: (config: any, tableName: string, limit: number, offset: number) => Promise<any>

  // Connection management
  saveConnection: (config: any) => Promise<any>
  getConnections: () => Promise<any>
  deleteConnection: (id: string) => Promise<any>

  // MySQL Dialog
  mysqlDialog: {
    open: () => Promise<void>
    close: () => Promise<void>
    save: (connectionData: any) => Promise<void>
    onSaved: (callback: (data: any) => void) => () => void
  }

  // Window controls
  windowControl: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}