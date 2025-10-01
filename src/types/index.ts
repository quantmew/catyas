export type DatabaseType =
  | 'mysql'
  | 'postgresql'
  | 'oracle'
  | 'sqlite'
  | 'sqlserver'
  | 'mariadb'
  | 'mongodb'
  | 'redis'

export interface Database {
  name: string
  tables?: Table[]
  expanded?: boolean
}

export interface Connection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  username: string
  password?: string
  database?: string
  ssl?: boolean
  databases?: Database[]
  expanded?: boolean
}

export interface Table {
  name: string
  schema?: string
  type: 'table' | 'view'
  rowCount?: number
}

export interface Column {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  key?: 'PRI' | 'UNI' | 'MUL'
  extra?: string
}

export interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
  executionTime: number
}