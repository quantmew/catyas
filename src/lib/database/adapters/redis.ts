import { createClient, RedisClientType } from 'redis'
import { Connection, QueryResult, Table, Column } from '../../../types'
import { DatabaseAdapter } from '../index'

export class RedisAdapter implements DatabaseAdapter {
  private client: RedisClientType | null = null

  constructor(private config: Connection) {}

  async connect(): Promise<void> {
    this.client = createClient({
      socket: {
        host: this.config.host,
        port: this.config.port,
      },
      password: this.config.password,
    })
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.client!.ping()
      return true
    } catch (error) {
      return false
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.client) throw new Error('Not connected')
    const startTime = Date.now()

    try {
      // Parse Redis command
      const parts = query.trim().split(/\s+/)
      const command = parts[0].toLowerCase()
      const args = parts.slice(1)

      let result: any
      switch (command) {
        case 'get':
          result = await this.client.get(args[0])
          break
        case 'set':
          result = await this.client.set(args[0], args[1])
          break
        case 'keys':
          result = await this.client.keys(args[0] || '*')
          break
        case 'hgetall':
          result = await this.client.hGetAll(args[0])
          break
        default:
          throw new Error(`Unsupported Redis command: ${command}`)
      }

      const executionTime = Date.now() - startTime
      const rows = Array.isArray(result) ? result.map(r => ({ value: r })) : [{ value: result }]

      return {
        columns: ['value'],
        rows,
        rowCount: rows.length,
        executionTime,
      }
    } catch (error) {
      throw error
    }
  }

  async getTables(): Promise<Table[]> {
    // Redis doesn't have tables, return databases
    return Array.from({ length: 16 }, (_, i) => ({
      name: `db${i}`,
      type: 'table' as const,
    }))
  }

  async getTableStructure(_tableName: string): Promise<Column[]> {
    return [
      {
        name: 'key',
        type: 'string',
        nullable: false,
      },
      {
        name: 'value',
        type: 'string',
        nullable: true,
      },
    ]
  }

  async getTableData(_tableName: string, limit: number, offset: number): Promise<QueryResult> {
    if (!this.client) throw new Error('Not connected')
    const startTime = Date.now()
    const keys = await this.client.keys('*')
    const limitedKeys = keys.slice(offset, offset + limit)

    const rows = await Promise.all(
      limitedKeys.map(async key => ({
        key,
        value: await this.client!.get(key),
      }))
    )

    const executionTime = Date.now() - startTime

    return {
      columns: ['key', 'value'],
      rows,
      rowCount: rows.length,
      executionTime,
    }
  }
}