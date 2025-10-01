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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}