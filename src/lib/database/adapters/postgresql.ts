import { Client } from 'pg'
import { Connection, QueryResult, Table, Column } from '../../../types'
import { DatabaseAdapter } from '../index'

export class PostgreSQLAdapter implements DatabaseAdapter {
  private client: Client | null = null

  constructor(private config: Connection) {}

  async connect(): Promise<void> {
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
    })
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.client!.query('SELECT 1')
      return true
    } catch (error) {
      return false
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.client) throw new Error('Not connected')
    const startTime = Date.now()
    const result = await this.client.query(query)
    const executionTime = Date.now() - startTime

    return {
      columns: result.fields.map(f => f.name),
      rows: result.rows,
      rowCount: result.rowCount || 0,
      executionTime,
    }
  }

  async getTables(): Promise<Table[]> {
    const result = await this.executeQuery(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    return result.rows.map(row => ({
      name: row.table_name,
      type: row.table_type === 'VIEW' ? 'view' : 'table',
    }))
  }

  async getTableStructure(tableName: string): Promise<Column[]> {
    const result = await this.executeQuery(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position
    `)
    return result.rows.map(row => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
    }))
  }

  async getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult> {
    return this.executeQuery(`SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`)
  }
}