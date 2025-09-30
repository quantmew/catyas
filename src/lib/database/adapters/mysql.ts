import mysql from 'mysql2/promise'
import { Connection, QueryResult, Table, Column } from '../../../types'
import { DatabaseAdapter } from '../index'

export class MySQLAdapter implements DatabaseAdapter {
  private connection: mysql.Connection | null = null

  constructor(private config: Connection) {}

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl ? {} : undefined,
    })
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.connection!.ping()
      return true
    } catch (error) {
      return false
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.connection) throw new Error('Not connected')
    const startTime = Date.now()
    const [rows, fields] = await this.connection.execute(query)
    const executionTime = Date.now() - startTime

    return {
      columns: fields.map(f => f.name),
      rows: Array.isArray(rows) ? rows : [],
      rowCount: Array.isArray(rows) ? rows.length : 0,
      executionTime,
    }
  }

  async getTables(): Promise<Table[]> {
    const result = await this.executeQuery('SHOW TABLES')
    return result.rows.map(row => ({
      name: Object.values(row)[0] as string,
      type: 'table' as const,
    }))
  }

  async getTableStructure(tableName: string): Promise<Column[]> {
    const result = await this.executeQuery(`DESCRIBE \`${tableName}\``)
    return result.rows.map(row => ({
      name: row.Field,
      type: row.Type,
      nullable: row.Null === 'YES',
      defaultValue: row.Default,
      key: row.Key || undefined,
      extra: row.Extra || undefined,
    }))
  }

  async getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult> {
    return this.executeQuery(`SELECT * FROM \`${tableName}\` LIMIT ${limit} OFFSET ${offset}`)
  }
}