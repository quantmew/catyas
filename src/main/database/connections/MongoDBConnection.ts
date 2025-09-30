import { MongoClient, Db } from 'mongodb'
import { DatabaseConnection, DatabaseConfig } from '../DatabaseManager'

export class MongoDBConnection implements DatabaseConnection {
  id: string
  config: DatabaseConfig
  private client?: MongoClient
  private db?: Db

  constructor(id: string, config: DatabaseConfig) {
    this.id = id
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      const uri = `mongodb://${this.config.username ? `${this.config.username}:${this.config.password}@` : ''}${this.config.host}:${this.config.port || 27017}/${this.config.database || ''}`
      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db(this.config.database)
    } catch (error) {
      throw new Error(`Failed to connect to MongoDB: ${error.message}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = undefined
      this.db = undefined
    }
  }

  async query(query: string): Promise<any> {
    if (!this.db) {
      throw new Error('Not connected to database')
    }
    try {
      const queryObj = JSON.parse(query)
      const collection = this.db.collection(queryObj.collection)

      switch (queryObj.operation) {
        case 'find':
          return await collection.find(queryObj.filter || {}).limit(queryObj.limit || 100).toArray()
        case 'findOne':
          return await collection.findOne(queryObj.filter || {})
        case 'insertOne':
          return await collection.insertOne(queryObj.document)
        case 'updateOne':
          return await collection.updateOne(queryObj.filter, queryObj.update)
        case 'deleteOne':
          return await collection.deleteOne(queryObj.filter)
        default:
          throw new Error(`Unsupported operation: ${queryObj.operation}`)
      }
    } catch (error) {
      throw new Error(`Failed to execute MongoDB query: ${error.message}`)
    }
  }

  async getDatabases(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const adminDb = this.client.db().admin()
    const result = await adminDb.listDatabases()
    return result.databases.map(db => db.name)
  }

  async getTables(database: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const db = this.client.db(database)
    const collections = await db.listCollections().toArray()
    return collections.map(col => col.name)
  }

  async getTableData(database: string, table: string, limit: number, offset: number): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const db = this.client.db(database)
    const collection = db.collection(table)
    return await collection.find({}).skip(offset).limit(limit).toArray()
  }
}