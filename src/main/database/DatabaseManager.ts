import { v4 as uuidv4 } from 'uuid'
import { MySQLConnection } from './connections/MySQLConnection'
import { PostgreSQLConnection } from './connections/PostgreSQLConnection'
import { SQLiteConnection } from './connections/SQLiteConnection'
import { MongoDBConnection } from './connections/MongoDBConnection'
import { RedisConnection } from './connections/RedisConnection'

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
  [key: string]: any
}

export interface DatabaseConnection {
  id: string
  config: DatabaseConfig
  connect(): Promise<void>
  disconnect(): Promise<void>
  query(sql: string): Promise<any>
  getDatabases(): Promise<string[]>
  getTables(database: string): Promise<string[]>
  getTableData(database: string, table: string, limit: number, offset: number): Promise<any>
  // Additional metadata APIs
  getTablesInfo?(database: string): Promise<any[]>
  getTableSchema?(database: string, table: string): Promise<any[]>
}

export class DatabaseManager {
  private connections: Map<string, DatabaseConnection> = new Map()

  async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
    const id = uuidv4()
    let connection: DatabaseConnection

    switch (config.type) {
      case 'mysql':
      case 'mariadb':
        connection = new MySQLConnection(id, config)
        break
      case 'postgresql':
        connection = new PostgreSQLConnection(id, config)
        break
      case 'sqlite':
        connection = new SQLiteConnection(id, config)
        break
      case 'mongodb':
        connection = new MongoDBConnection(id, config)
        break
      case 'redis':
        connection = new RedisConnection(id, config)
        break
      default:
        throw new Error(`Unsupported database type: ${config.type}`)
    }

    await connection.connect()
    this.connections.set(id, connection)
    return connection
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (connection) {
      await connection.disconnect()
      this.connections.delete(connectionId)
    }
  }

  async query(connectionId: string, sql: string): Promise<any> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    return await connection.query(sql)
  }

  async getDatabases(connectionId: string): Promise<string[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    return await connection.getDatabases()
  }

  async getTables(connectionId: string, database: string): Promise<string[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    return await connection.getTables(database)
  }

  async getTableData(connectionId: string, database: string, table: string, limit: number = 100, offset: number = 0): Promise<any> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    return await connection.getTableData(database, table, limit, offset)
  }

  async getTablesInfo(connectionId: string, database: string): Promise<any[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    if (!connection.getTablesInfo) {
      // Fallback: return simple list of names when not implemented
      const names = await connection.getTables(database)
      return names.map((name) => ({ name }))
    }
    return await connection.getTablesInfo(database)
  }

  async getTableSchema(connectionId: string, database: string, table: string): Promise<any[]> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }
    if (!connection.getTableSchema) {
      return []
    }
    return await connection.getTableSchema(database, table)
  }
}
