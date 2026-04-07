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
  views?: { name: string }[]
  expanded?: boolean
}

export interface AttachedDatabase {
  id: string
  name: string
  file: string
  encrypted: boolean
}

export interface HttpTunnelConfig {
  url: string
  useBase64?: boolean
  auth?: {
    type: 'password' | 'certificate'
    username?: string
    password?: string
    clientKey?: string
    clientCert?: string
    caCert?: string
    passphrase?: string
  }
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
  // SQLite specific
  settingsPath?: string
  autoConnect?: boolean
  encrypted?: boolean
  encryptPassword?: string
  attachedDatabases?: AttachedDatabase[]
  httpTunnel?: HttpTunnelConfig
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
