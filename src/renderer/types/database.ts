export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb' | 'redis' | 'oracle' | 'sqlserver' | 'mariadb'
  name: string
  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
  filePath?: string
  ssl?: boolean
}

export interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
  executionTime?: number
}

export interface TableInfo {
  name: string
  type: 'table' | 'view'
  rowCount?: number
  size?: string
}

export interface DatabaseInfo {
  name: string
  tables: TableInfo[]
  views: TableInfo[]
}