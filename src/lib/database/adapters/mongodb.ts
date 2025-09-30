import { MongoClient, Db } from 'mongodb'
import { Connection, QueryResult, Table, Column } from '../../../types'
import { DatabaseAdapter } from '../index'

export class MongoDBAdapter implements DatabaseAdapter {
  private client: MongoClient | null = null
  private db: Db | null = null

  constructor(private config: Connection) {}

  async connect(): Promise<void> {
    const url = `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`
    this.client = new MongoClient(url)
    await this.client.connect()
    this.db = this.client.db(this.config.database)
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.client!.db().admin().ping()
      return true
    } catch (error) {
      return false
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.db) throw new Error('Not connected')
    const startTime = Date.now()

    try {
      // Parse query as JSON
      const queryObj = JSON.parse(query)
      const collection = this.db.collection(queryObj.collection)
      const rows = await collection.find(queryObj.filter || {}).limit(queryObj.limit || 100).toArray()
      const executionTime = Date.now() - startTime

      const columns = rows.length > 0 ? Object.keys(rows[0]) : []

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
    if (!this.db) throw new Error('Not connected')
    const collections = await this.db.listCollections().toArray()
    return collections.map(col => ({
      name: col.name,
      type: 'table' as const,
    }))
  }

  async getTableStructure(tableName: string): Promise<Column[]> {
    // MongoDB is schemaless, return sample document structure
    if (!this.db) throw new Error('Not connected')
    const collection = this.db.collection(tableName)
    const sample = await collection.findOne()

    if (!sample) return []

    return Object.keys(sample).map(key => ({
      name: key,
      type: typeof sample[key],
      nullable: true,
    }))
  }

  async getTableData(tableName: string, limit: number, offset: number): Promise<QueryResult> {
    if (!this.db) throw new Error('Not connected')
    const startTime = Date.now()
    const collection = this.db.collection(tableName)
    const rows = await collection.find().skip(offset).limit(limit).toArray()
    const executionTime = Date.now() - startTime

    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTime,
    }
  }
}