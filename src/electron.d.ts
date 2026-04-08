export interface ElectronAPI {
  // Platform info
  platform: NodeJS.Platform

  // Database operations
  testConnection: (config: any) => Promise<{ success: boolean; message: string }>
  getDatabases: (config: any) => Promise<{ success: boolean; databases?: any[]; message?: string }>
  getTables: (config: any, database: string) => Promise<{ success: boolean; tables?: any[]; message?: string }>
  getViews: (config: any, database: string) => Promise<{ success: boolean; views?: any[]; message?: string }>
  executeQuery: (config: any, query: string, database?: string) => Promise<{ success: boolean; data?: any[]; message?: string }>
  getTableStructure: (config: any, database: string, tableName: string) => Promise<{ success: boolean; structure?: any[]; message?: string }>
  getTableData: (config: any, database: string, tableName: string, limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; message?: string }>
  getTableInfo: (config: any, database: string, tableName: string) => Promise<{ success: boolean; info?: any; message?: string }>

  // Connection management
  saveConnection: (config: any) => Promise<any>
  getConnections: () => Promise<any>
  deleteConnection: (id: string) => Promise<any>

  // File dialog
  openFileDialog: (options?: any) => Promise<{ success: boolean; filePath?: string }>
  saveFileDialog: (options?: any) => Promise<{ success: boolean; filePath?: string }>
  openDirectoryDialog: (options?: any) => Promise<{ success: boolean; filePath?: string }>
  createSqliteDatabase: (filePath: string) => Promise<{ success: boolean; filePath?: string; message?: string }>

  // Window control
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>
  closeWindow: () => Promise<void>

  // External shell
  openExternal: (url: string) => Promise<{ success: boolean }>

  // App info
  getAppInfo: () => Promise<{ name: string; version: string; description: string }>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
