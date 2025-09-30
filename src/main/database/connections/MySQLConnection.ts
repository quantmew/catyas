import mysql from 'mysql2/promise'
import { DatabaseConnection, DatabaseConfig } from '../DatabaseManager'

export class MySQLConnection implements DatabaseConnection {
  id: string
  config: DatabaseConfig
  private connection?: mysql.Connection

  constructor(id: string, config: DatabaseConfig) {
    this.id = id
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port || 3306,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? {} : false
      })
    } catch (error) {
      throw new Error(`Failed to connect to MySQL: ${error.message}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end()
      this.connection = undefined
    }
  }

  async query(sql: string): Promise<any> {
    if (!this.connection) {
      throw new Error('Not connected to database')
    }
    const [rows] = await this.connection.execute(sql)
    return rows
  }

  async getDatabases(): Promise<string[]> {
    const result = await this.query('SHOW DATABASES')
    return result.map((row: any) => row.Database)
  }

  async getTables(database: string): Promise<string[]> {
    const result = await this.query(`SHOW TABLES FROM \`${database}\``)
    const key = `Tables_in_${database}`
    return result.map((row: any) => row[key])
  }

  async getTableData(database: string, table: string, limit: number, offset: number): Promise<any> {
    const sql = `SELECT * FROM \`${database}\`.\`${table}\` LIMIT ${limit} OFFSET ${offset}`
    return await this.query(sql)
  }

  async getTablesInfo(database: string): Promise<any[]> {
    const sql = `
      SELECT
        TABLE_NAME AS name,
        TABLE_ROWS AS rows,
        ENGINE AS engine,
        DATA_LENGTH AS data_length,
        INDEX_LENGTH AS index_length,
        (DATA_LENGTH + INDEX_LENGTH) AS total_length,
        AUTO_INCREMENT AS auto_increment,
        TABLE_COLLATION AS table_collation,
        ROW_FORMAT AS row_format,
        CREATE_TIME AS create_time,
        UPDATE_TIME AS update_time
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${database}'
      ORDER BY TABLE_NAME
    `
    return await this.query(sql)
  }

  async getTableSchema(database: string, table: string): Promise<any[]> {
    const sql = `
      SELECT
        COLUMN_NAME   AS name,
        COLUMN_TYPE   AS type,
        IF(IS_NULLABLE='NO', 1, 0) AS not_null,
        COLUMN_DEFAULT AS default_value,
        COLUMN_COMMENT AS comment,
        EXTRA AS extra,
        COLUMN_KEY AS column_key
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA='${database}' AND TABLE_NAME='${table}'
      ORDER BY ORDINAL_POSITION
    `
    return await this.query(sql)
  }
}
