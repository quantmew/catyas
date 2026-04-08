declare module 'oracledb' {
  export interface Pool {
    getConnection(): Promise<Connection>
    close(a?: number): Promise<void>
  }
  export interface Connection {
    execute(sql: string, binds?: any, options?: any): Promise<ExecResult>
    close(): Promise<void>
  }
  export interface ExecResult {
    rows?: any[][]
    metaData?: { name: string }[]
  }
  export function createPool(attrs: any): Pool
  function getConnection(attrs: any): Promise<Connection>
}
