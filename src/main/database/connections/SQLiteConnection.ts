import sqlite3 from 'sqlite3'
import { DatabaseConnection, DatabaseConfig } from '../DatabaseManager'

export class SQLiteConnection implements DatabaseConnection {
  id: string
  config: DatabaseConfig
  private db?: sqlite3.Database

  constructor(id: string, config: DatabaseConfig) {
    this.id = id
    this.config = config
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.config.filePath || ':memory:', (err) => {
        if (err) {
          reject(new Error(`Failed to connect to SQLite: ${err.message}`))
        } else {
          resolve()
        }
      })
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err)
          } else {
            this.db = undefined
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  async query(sql: string): Promise<any> {
    if (!this.db) {
      throw new Error('Not connected to database')
    }

    return new Promise((resolve, reject) => {
      this.db!.all(sql, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  async getDatabases(): Promise<string[]> {
    return ['main']
  }

  async getTables(database: string): Promise<string[]> {
    const result = await this.query(`
      SELECT name
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `)
    return result.map((row: any) => row.name)
  }

  async getTableData(database: string, table: string, limit: number, offset: number): Promise<any> {
    const sql = `SELECT * FROM "${table}" LIMIT ${limit} OFFSET ${offset}`
    return await this.query(sql)
  }

  async getTablesInfo(database: string): Promise<any[]> {
    // SQLite has limited metadata. Return names only.
    const names = await this.getTables(database)
    return names.map((name) => ({ name }))
  }

  async getTableSchema(database: string, table: string): Promise<any[]> {
    const rows = await this.query(`PRAGMA table_info('${table}')`)
    return rows.map((r: any) => ({
      name: r.name,
      type: r.type,
      not_null: r.notnull,
      default_value: r.dflt_value
    }))
  }
}
