import { createClient, RedisClientType } from 'redis'
import { DatabaseConnection, DatabaseConfig } from '../DatabaseManager'

export class RedisConnection implements DatabaseConnection {
  id: string
  config: DatabaseConfig
  private client?: RedisClientType

  constructor(id: string, config: DatabaseConfig) {
    this.id = id
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port || 6379
        },
        password: this.config.password,
        database: this.config.database ? parseInt(this.config.database) : 0
      })
      await this.client.connect()
    } catch (error) {
      throw new Error(`Failed to connect to Redis: ${error.message}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = undefined
    }
  }

  async query(command: string): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const parts = command.trim().split(' ')
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case 'get':
        return await this.client.get(args[0])
      case 'set':
        return await this.client.set(args[0], args.slice(1).join(' '))
      case 'keys':
        return await this.client.keys(args[0] || '*')
      case 'del':
        return await this.client.del(args)
      case 'exists':
        return await this.client.exists(args)
      case 'ttl':
        return await this.client.ttl(args[0])
      case 'type':
        return await this.client.type(args[0])
      default:
        throw new Error(`Unsupported Redis command: ${cmd}`)
    }
  }

  async getDatabases(): Promise<string[]> {
    const databases = []
    for (let i = 0; i < 16; i++) {
      databases.push(`db${i}`)
    }
    return databases
  }

  async getTables(database: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    return await this.client.keys('*')
  }

  async getTableData(database: string, table: string, limit: number, offset: number): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }
    const type = await this.client.type(table)
    const value = await this.client.get(table)
    return {
      key: table,
      type,
      value,
      ttl: await this.client.ttl(table)
    }
  }
}