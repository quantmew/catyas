import { Client } from 'pg'
import { DatabaseConnection, DatabaseConfig } from '../DatabaseManager'

export class PostgreSQLConnection implements DatabaseConnection {
  id: string
  config: DatabaseConfig
  private client?: Client

  constructor(id: string, config: DatabaseConfig) {
    this.id = id
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      this.client = new Client({
        host: this.config.host,
        port: this.config.port || 5432,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false
      })
      await this.client.connect()
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error.message}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = undefined
    }
  }

  async query(sql: string): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const result = await this.client.query(sql)
    return result.rows
  }

  async getDatabases(): Promise<string[]> {
    const result = await this.query("SELECT datname FROM pg_database WHERE datistemplate = false")
    return result.map((row: any) => row.datname)
  }

  async getTables(database: string): Promise<string[]> {
    const result = await this.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `)
    return result.map((row: any) => row.tablename)
  }

  async getTableData(database: string, table: string, limit: number, offset: number): Promise<any> {
    const sql = `SELECT * FROM "${table}" LIMIT ${limit} OFFSET ${offset}`
    return await this.query(sql)
  }

  async getTablesInfo(database: string): Promise<any[]> {
    // Public schema overview with approximate row counts and sizes
    const sql = `
      SELECT
        c.relname AS name,
        COALESCE(s.n_live_tup, 0) AS rows,
        pg_relation_size(c.oid) AS data_length,
        (pg_total_relation_size(c.oid) - pg_relation_size(c.oid)) AS index_length,
        pg_total_relation_size(c.oid) AS total_length,
        'heap' AS engine,
        NULL::bigint AS auto_increment,
        NULL::text AS table_collation,
        NULL::text AS row_format,
        NULL::timestamp AS create_time,
        NULL::timestamp AS update_time
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
      WHERE c.relkind = 'r' AND n.nspname = 'public'
      ORDER BY c.relname
    `
    return await this.query(sql)
  }

  async getTableSchema(database: string, table: string): Promise<any[]> {
    const sql = `
      SELECT
        column_name AS name,
        data_type   AS type,
        CASE WHEN is_nullable='NO' THEN 1 ELSE 0 END AS not_null,
        column_default AS default_value
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='${table}'
      ORDER BY ordinal_position
    `
    return await this.query(sql)
  }
}
