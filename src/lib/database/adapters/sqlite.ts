import Database from 'better-sqlite3'
import { Connection, QueryResult, Table, Column } from '../../../types'
import { DatabaseAdapter } from '../index'

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database | null = null

  constructor(private config: Connection) {}

  async connect(): Promise<void> {
    this.db = new Database(this.config.database || ':memory:')
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      this.db!.prepare('SELECT 1').get()
      return true
    } catch (error) {
      return false
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.db) throw new Error('Not connected')
    const startTime = Date.now()

    try {
      const stmt = this.db.prepare(query)
      const rows = stmt.all()
      const executionTime = Date.now() - startTime

      const columns = rows.length > 0 ? Object.keys(rows[0] as object) : []

      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTime,
      }
    } catch (error) {
      throw error
    }
  }

  async getTables(): Promise<Table[]> {
    const result = await this.executeQuery(`
      SELECT name, type
      FROM sqlite_master
      WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `)
    return result.rows.map(row => ({
      name: row.name,
      type: row.type as 'table' | 'view',
    }))
  }

  async getTableStructure(tableName: string): Promise<Column[]> {
    const result = await this.executeQuery(`PRAGMA table_info("${tableName}")`)
    return result.rows.map(row => ({
      name: row.name,
      type: row.type,
      nullable: row.notnull === 0,
      defaultValue: row.dflt_value,
      key: row.pk ? 'PRI' : undefined,
    }))
  }

  async getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult> {
    return this.executeQuery(`SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`)
  }
}