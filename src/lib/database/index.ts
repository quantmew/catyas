import { Connection, QueryResult, Table, Column } from '../../types'
import { MySQLAdapter } from './adapters/mysql'
import { PostgreSQLAdapter } from './adapters/postgresql'
import { SQLiteAdapter } from './adapters/sqlite'
import { MongoDBAdapter } from './adapters/mongodb'
import { RedisAdapter } from './adapters/redis'

export interface DatabaseAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  testConnection(): Promise<boolean>
  executeQuery(query: string): Promise<QueryResult>
  getTables(): Promise<Table[]>
  getTableStructure(tableName: string): Promise<Column[]>
  getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult>
}

export class DatabaseManager {
  private adapter: DatabaseAdapter | null = null

  constructor(private connection: Connection) {}

  async connect(): Promise<void> {
    this.adapter = this.createAdapter()
    await this.adapter.connect()
  }

  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect()
      this.adapter = null
    }
  }

  async testConnection(): Promise<boolean> {
    const adapter = this.createAdapter()
    try {
      return await adapter.testConnection()
    } finally {
      await adapter.disconnect()
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.adapter) throw new Error('Not connected')
    return this.adapter.executeQuery(query)
  }

  async getTables(): Promise<Table[]> {
    if (!this.adapter) throw new Error('Not connected')
    return this.adapter.getTables()
  }

  async getTableStructure(tableName: string): Promise<Column[]> {
    if (!this.adapter) throw new Error('Not connected')
    return this.adapter.getTableStructure(tableName)
  }

  async getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult> {
    if (!this.adapter) throw new Error('Not connected')
    return this.adapter.getTableData(tableName, limit, offset)
  }

  private createAdapter(): DatabaseAdapter {
    switch (this.connection.type) {
      case 'mysql':
      case 'mariadb':
        return new MySQLAdapter(this.connection)
      case 'postgresql':
        return new PostgreSQLAdapter(this.connection)
      case 'sqlite':
        return new SQLiteAdapter(this.connection)
      case 'mongodb':
        return new MongoDBAdapter(this.connection)
      case 'redis':
        return new RedisAdapter(this.connection)
      default:
        throw new Error(`Unsupported database type: ${this.connection.type}`)
    }
  }
}