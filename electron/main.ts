import { app, BrowserWindow, ipcMain, dialog, OpenDialogOptions, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mysql from 'mysql2/promise'
import sqlite3 from 'better-sqlite3'
import { Pool as PgPool } from 'pg'
import oracledb from 'oracledb'
import { Connection as TediousConnection, Request as TediousRequest } from 'tedious'
import { MongoClient } from 'mongodb'
import { createClient as createRedisClient } from 'redis'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // Close existing window if it exists
  if (mainWindow) {
    mainWindow.close()
    mainWindow = null
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true
    },
    title: 'Catyas',
    backgroundColor: '#1e1e1e',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Add timeout fallback to show window even if ready-to-show doesn't fire
  const showTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('Window not shown after 3s, forcing show')
      mainWindow.show()
    }
  }, 3000)

  mainWindow.once('show', () => {
    clearTimeout(showTimeout)
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      .then(() => {
        console.log('Dev server loaded successfully')
        mainWindow?.webContents.openDevTools()
      })
      .catch(err => {
        console.error('Failed to load dev server:', err)
        // Show window anyway so user can see the error
        mainWindow?.show()
      })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
      .catch(err => {
        console.error('Failed to load index.html:', err)
        mainWindow?.show()
      })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Connection persistence
const CONNECTIONS_FILE = path.join(app.getPath('userData'), 'connections.json')

function loadSavedConnections(): any[] {
  try {
    if (fs.existsSync(CONNECTIONS_FILE)) {
      const data = fs.readFileSync(CONNECTIONS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Failed to load connections:', err)
  }
  return []
}

function saveConnectionsToFile(connections: any[]): void {
  try {
    fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save connections:', err)
  }
}

// File dialog handler
ipcMain.handle('dialog:open-file', async (_event, options?: OpenDialogOptions) => {
  try {
    const win = mainWindow
    const dialogOptions: OpenDialogOptions = {
      title: '选择文件',
      filters: options?.filters || [
        { name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    }
    const result = win
      ? await dialog.showOpenDialog(win, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions)

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] }
    }
    return { success: false, filePath: null }
  } catch (err) {
    console.error('Failed to open file dialog:', err)
    return { success: false, filePath: null }
  }
})

// Directory dialog handler
ipcMain.handle('dialog:open-directory', async (_event, options?: { title?: string; defaultPath?: string }) => {
  try {
    const win = mainWindow
    const dialogOptions: OpenDialogOptions = {
      title: options?.title || '选择目录',
      defaultPath: options?.defaultPath,
      properties: ['openDirectory', 'createDirectory']
    }
    const result = win
      ? await dialog.showOpenDialog(win, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions)

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] }
    }
    return { success: false, filePath: null }
  } catch (err) {
    console.error('Failed to open directory dialog:', err)
    return { success: false, filePath: null }
  }
})

// Window control IPC handlers
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:alwaysOnTop', (_event, alwaysOnTop: boolean) => {
  mainWindow?.setAlwaysOnTop(alwaysOnTop)
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

// Open external URL
ipcMain.handle('shell:open-external', async (_event, url: string) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// Show about dialog
ipcMain.handle('app:about', async () => {
  return {
    name: 'Catyas',
    version: '1.0.0',
    description: 'A modern database connection manager like Navicat',
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
})

// Save file dialog handler (for creating new files)
ipcMain.handle('dialog:save-file', async (_event, options?: {
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
}) => {
  try {
    const win = mainWindow
    const dialogOptions: Electron.SaveDialogOptions = {
      title: options?.title || '保存文件',
      defaultPath: options?.defaultPath,
      filters: options?.filters || [
        { name: 'SQLite Database', extensions: ['db', 'sqlite3'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }
    const result = win
      ? await dialog.showSaveDialog(win, dialogOptions)
      : await dialog.showSaveDialog(dialogOptions)

    if (!result.canceled && result.filePath) {
      return { success: true, filePath: result.filePath }
    }
    return { success: false, filePath: null }
  } catch (err) {
    console.error('Failed to open save dialog:', err)
    return { success: false, filePath: null }
  }
})

// Create SQLite database file
ipcMain.handle('sqlite:create-database', async (_event, filePath: string) => {
  try {
    if (!filePath) {
      return { success: false, message: 'No file path specified' }
    }
    // better-sqlite3 automatically creates the file when opening
    const db = new sqlite3(filePath)
    db.close()
    return { success: true, filePath }
  } catch (err: any) {
    console.error('Failed to create SQLite database:', err)
    return { success: false, message: err.message }
  }
})

// Connection persistence IPC handlers
ipcMain.handle('connection:save', async (_event, config) => {
  try {
    const connections = loadSavedConnections()
    const existingIdx = connections.findIndex((c: any) => c.id === config.id)
    if (existingIdx >= 0) {
      connections[existingIdx] = config
    } else {
      connections.push(config)
    }
    saveConnectionsToFile(connections)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('connection:get-all', async () => {
  try {
    return { success: true, connections: loadSavedConnections() }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('connection:delete', async (_event, id) => {
  try {
    const connections = loadSavedConnections()
    const filtered = connections.filter((c: any) => c.id !== id)
    saveConnectionsToFile(filtered)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

// Database connection cache
const connectionPool = new Map<string, mysql.Pool>()
const sqliteConnections = new Map<string, sqlite3.Database>()
const pgPools = new Map<string, PgPool>()
const oraclePools = new Map<string, oracledb.Pool>()
const mongoClients = new Map<string, MongoClient>()
const redisClients = new Map<string, ReturnType<typeof createRedisClient>>()

// Identifier whitelist validation to prevent SQL injection
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

// Helper function to get or create connection pool (optionally scoped to a database)
function getConnectionPool(config: any, database?: string): mysql.Pool {
  const key = `${config.host}:${config.port}:${config.username}:${database || config.database || ''}`

  if (!connectionPool.has(key)) {
    const pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: database || config.database || undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
    connectionPool.set(key, pool)
  }

  return connectionPool.get(key)!
}

// Helper function to get or create PostgreSQL connection pool
function getPgPool(config: any, database?: string): PgPool {
  const key = `pg:${config.host}:${config.port}:${config.username}:${database || config.database || 'postgres'}`

  if (!pgPools.has(key)) {
    const pool = new PgPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: database || config.database || 'postgres',
      max: 10,
      idleTimeoutMillis: 30000,
    })
    pgPools.set(key, pool)
  }

  return pgPools.get(key)!
}

function getOraclePool(config: any): oracledb.Pool {
  const key = `oracle:${config.host}:${config.port}:${config.username}:${config.database || ''}`
  if (!oraclePools.has(key)) {
    const pool = oracledb.createPool({
      user: config.username,
      password: config.password,
      connectString: `${config.host}:${config.port || 1521}/${config.database || config.serviceName || 'ORCL'}`,
      poolMin: 1,
      poolMax: 10,
    })
    oraclePools.set(key, pool)
  }
  return oraclePools.get(key)!
}

async function getMongoClient(config: any): Promise<MongoClient> {
  const key = `mongo:${config.host}:${config.port}`
  if (!mongoClients.has(key)) {
    let uri: string
    if (config.connectionString) {
      uri = config.connectionString
    } else {
      const auth = config.username ? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@` : ''
      uri = `mongodb://${auth}${config.host}:${config.port || 27017}/${config.database || 'admin'}`
    }
    const client = new MongoClient(uri)
    await client.connect()
    mongoClients.set(key, client)
  }
  return mongoClients.get(key)!
}

async function getRedisClient(config: any): Promise<ReturnType<typeof createRedisClient>> {
  const key = `redis:${config.host}:${config.port}`
  if (!redisClients.has(key)) {
    const client = createRedisClient({
      socket: {
        host: config.host || '127.0.0.1',
        port: Number(config.port) || 6379,
      },
      password: config.password || undefined,
      database: Number(config.databaseIndex) || 0,
    })
    await client.connect()
    redisClients.set(key, client)
  }
  return redisClients.get(key)!
}

// Helper function to get or create SQLite connection
function getSqliteConnection(config: any): sqlite3.Database {
  const filePath = config.host || config.filePath
  const key = `sqlite:${filePath}`

  if (!sqliteConnections.has(key)) {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    let db: sqlite3.Database

    // Open with encryption if provided
    if (config.encrypted && config.encryptPassword) {
      db = new sqlite3(filePath)
      db.pragma(`key='${config.encryptPassword}'`)
    } else {
      db = new sqlite3(filePath)
    }

    // Apply settings if provided
    if (config.settingsPath && fs.existsSync(config.settingsPath)) {
      // Read and apply SQLite configuration
      const settings = fs.readFileSync(config.settingsPath, 'utf-8')
      // Settings file format: PRAGMA commands, one per line
      settings.split('\n').forEach((line: string) => {
        if (line.trim().startsWith('PRAGMA')) {
          try {
            db.exec(line)
          } catch (e) {
            console.error('Failed to apply setting:', line, e)
          }
        }
      })
    }

    sqliteConnections.set(key, db)
  }

  return sqliteConnections.get(key)!
}

// IPC Handlers
ipcMain.handle('db:test-connection', async (_event, config) => {
  console.log('[Main] Testing connection to:', config)

  try {
    // SQLite connection test
    if (config.type === 'sqlite') {
      const filePath = config.host || config.filePath
      if (!filePath) {
        return { success: false, message: 'Database file path required' }
      }

      // Check if file exists (for existing databases)
      if (config.dbType === 'existing' && !fs.existsSync(filePath)) {
        return { success: false, message: 'Database file does not exist' }
      }

      // Try to open the database
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        return { success: false, message: 'Directory does not exist' }
      }

      // Test connection by opening and running a simple query
      const db = new sqlite3(filePath)
      db.exec('SELECT 1')
      db.close()

      return { success: true, message: 'Connection successful!' }
    }

    // PostgreSQL connection test
    if (config.type === 'postgresql') {
      const pool = new PgPool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database || 'postgres',
      })
      await pool.query('SELECT 1')
      await pool.end()
      return { success: true, message: 'Connection successful!' }
    }

    // Oracle connection test
    if (config.type === 'oracle') {
      const conn = await oracledb.getConnection({
        user: config.username,
        password: config.password,
        connectString: `${config.host}:${config.port || 1521}/${config.database || config.serviceName || 'ORCL'}`,
      })
      await conn.close()
      return { success: true, message: 'Connection successful!' }
    }

    // SQL Server connection test
    if (config.type === 'sqlserver') {
      const authType = config.authType || 'sql'
      const auth: any = {}
      if (authType === 'windows') {
        auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
      } else {
        auth.userName = config.username
        auth.password = config.password
      }
      await new Promise<void>((resolve, reject) => {
        const conn = new TediousConnection({
          server: config.host,
          options: {
            port: Number(config.port) || 1433,
            database: config.database || 'master',
            encrypt: true,
            trustServerCertificate: true,
            instanceName: config.instanceName || undefined,
          },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) reject(err)
          else { conn.close(); resolve() }
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, message: 'Connection successful!' }
    }

    // MongoDB connection test
    if (config.type === 'mongodb') {
      let uri: string
      if (config.connectionString) {
        uri = config.connectionString
      } else {
        const auth = config.username ? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@` : ''
        uri = `mongodb://${auth}${config.host}:${config.port || 27017}/${config.database || 'admin'}`
      }
      const client = new MongoClient(uri)
      await client.connect()
      await client.db().command({ ping: 1 })
      await client.close()
      return { success: true, message: 'Connection successful!' }
    }

    // Redis connection test
    if (config.type === 'redis') {
      const client = createRedisClient({
        socket: { host: config.host || '127.0.0.1', port: Number(config.port) || 6379 },
        password: config.password || undefined,
        database: Number(config.databaseIndex) || 0,
      })
      await client.connect()
      await client.ping()
      await client.disconnect()
      return { success: true, message: 'Connection successful!' }
    }

    // MySQL connection test
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database || undefined,
      connectTimeout: 10000, // 10 seconds timeout
    })
    console.log('[Main] Connection created, pinging...')
    await connection.ping()
    console.log('[Main] Ping successful')
    await connection.end()
    console.log('[Main] Connection closed')
    return { success: true, message: 'Connection successful!' }
  } catch (error: any) {
    console.error('[Main] Connection error:', error)
    return { success: false, message: error.message || error.code || String(error) }
  }
})

ipcMain.handle('db:get-databases', async (_event, config) => {
  try {
    // SQLite doesn't have multiple databases in the same way as MySQL
    // For SQLite, we return the main database file
    if (config.type === 'sqlite') {
      return { success: true, databases: [{ Database: 'main' }] }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, 'postgres')
      const result = await pool.query('SELECT datname as "Database" FROM pg_database WHERE datistemplate = false')
      return { success: true, databases: result.rows }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const result = await conn.execute('SELECT name AS "Database" FROM v$database')
      await conn.close()
      return { success: true, databases: (result.rows || []).map((r: any) => ({ Database: r[0] })) }
    }

    if (config.type === 'sqlserver') {
      // SQL Server: list databases
      const result = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else {
          auth.userName = config.username; auth.password = config.password
        }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database: 'master', encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest('SELECT name AS Database FROM sys.databases WHERE state = 0', (err2: any) => {
            if (err2) reject(err2)
            else { conn.close(); resolve(rows) }
          })
          req.on('row', (cols: any[]) => {
            const row: any = {}
            cols.forEach(col => { row[col.metadata.colName] = col.value })
            rows.push(row)
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, databases: result }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const adminDb = client.db().admin()
      const dbs = await adminDb.listDatabases()
      return { success: true, databases: dbs.databases.map((d: any) => ({ Database: d.name })) }
    }

    if (config.type === 'redis') {
      // Redis has "databases" as numeric indexes, return selected one
      const dbIndex = Number(config.databaseIndex) || 0
      return { success: true, databases: [{ Database: `db${dbIndex}` }] }
    }

    const pool = getConnectionPool(config)
    const [rows] = await pool.query('SHOW DATABASES')
    return { success: true, databases: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-tables', async (_event, config, database) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
      return { success: true, tables: rows.map((r: any) => ({ [r.name]: r.name })) }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
      return { success: true, tables: (result.rows || []).map((r: any) => ({ [r.tablename]: r.tablename })) }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const result = await conn.execute("SELECT table_name FROM user_tables ORDER BY table_name")
      await conn.close()
      return { success: true, tables: (result.rows || []).map((r: any) => ({ [r[0]]: r[0] })) }
    }

    if (config.type === 'sqlserver') {
      const result = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database, encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME", (err2: any) => {
            if (err2) reject(err2)
            else { conn.close(); resolve(rows) }
          })
          req.on('row', (cols: any[]) => {
            const name = cols[0].value
            rows.push({ [name]: name })
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, tables: result }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const db = client.db(database)
      const collections = await db.listCollections({}, { nameOnly: true }).toArray()
      return { success: true, tables: collections.map((c: any) => ({ [c.name]: c.name })) }
    }

    if (config.type === 'redis') {
      const client = await getRedisClient(config)
      const keys = await client.keys('*')
      // Group keys by prefix (before first ':') as pseudo-tables
      const prefixes = new Set<string>()
      keys.forEach((k: string) => prefixes.add(k.split(':')[0] || k))
      return { success: true, tables: Array.from(prefixes).map(p => ({ [p]: p })) }
    }

    if (!isValidIdentifier(database)) {
      return { success: false, message: `Invalid database name: ${database}` }
    }
    const pool = getConnectionPool(config)
    const [rows] = await pool.query(`SHOW TABLES FROM \`${database}\``)
    return { success: true, tables: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

// MySQL/MariaDB: fetch views for a database
ipcMain.handle('db:get-views', async (_event, config, database) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all()
      return { success: true, views: rows.map((r: any) => ({ TABLE_NAME: r.name })) }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const result = await pool.query("SELECT viewname as \"TABLE_NAME\" FROM pg_views WHERE schemaname = 'public'")
      return { success: true, views: result.rows }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const result = await conn.execute("SELECT view_name FROM user_views ORDER BY view_name")
      await conn.close()
      return { success: true, views: (result.rows || []).map((r: any) => ({ TABLE_NAME: r[0] })) }
    }

    if (config.type === 'sqlserver') {
      const result = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database, encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest("SELECT TABLE_NAME AS TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS ORDER BY TABLE_NAME", (err2: any) => {
            if (err2) reject(err2)
            else { conn.close(); resolve(rows) }
          })
          req.on('row', (cols: any[]) => {
            const row: any = {}
            cols.forEach(col => { row[col.metadata.colName] = col.value })
            rows.push(row)
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, views: result }
    }

    if (config.type === 'mongodb') {
      // MongoDB views are returned as collections with type 'view'
      const client = await getMongoClient(config)
      const db = client.db(database)
      const collections = await db.listCollections({ type: 'view' }, { nameOnly: true }).toArray()
      return { success: true, views: collections.map((c: any) => ({ TABLE_NAME: c.name })) }
    }

    if (config.type === 'redis') {
      return { success: true, views: [] }
    }

    const pool = getConnectionPool(config)
    const [rows] = await pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'VIEW'`,
      [database]
    )
    return { success: true, views: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:execute-query', async (_event, config, query, database) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      const stmt = db.prepare(query)
      const rows = stmt.all()
      return { success: true, data: rows }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const result = await Promise.race([
        pool.query(query),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
      ]) as any
      return { success: true, data: result.rows }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      try {
        const result = await Promise.race([
          conn.execute(query),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
        ]) as any
        const columns = result.metaData?.map((m: any) => m.name) || []
        const data = result.rows?.map((row: any[]) => {
          const obj: any = {}
          columns.forEach((col: string, i: number) => { obj[col] = row[i] })
          return obj
        }) || []
        return { success: true, data }
      } finally {
        await conn.close()
      }
    }

    if (config.type === 'sqlserver') {
      const data = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database: database || 'master', encrypt: true, trustServerCertificate: true },
          ...auth,
        })

        // Add timeout
        const timeout = setTimeout(() => {
          conn.close()
          reject(new Error('Query timeout after 30s'))
        }, 30000)

        conn.on('connect', (err: any) => {
          if (err) {
            clearTimeout(timeout)
            return reject(err)
          }
          const req = new TediousRequest(query, (err2: any) => {
            clearTimeout(timeout)
            if (err2) reject(err2)
            else { conn.close(); resolve(rows) }
          })
          req.on('row', (cols: any[]) => {
            const row: any = {}
            cols.forEach(col => { row[col.metadata.colName] = col.value })
            rows.push(row)
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => {
          clearTimeout(timeout)
          reject(err)
        })
      })
      return { success: true, data }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const db = client.db(database)
      // For MongoDB, interpret query as a JSON command: { "collection": "name", "filter": {}, "limit": 10 }
      let parsed: any
      try {
        parsed = JSON.parse(query)
      } catch {
        return { success: false, message: 'MongoDB queries must be valid JSON: { "collection": "name", "filter": {} }' }
      }
      const collection = db.collection(parsed.collection)
      let cursor = collection.find(parsed.filter || {})
      if (parsed.limit) cursor = cursor.limit(parsed.limit)
      if (parsed.sort) cursor = cursor.sort(parsed.sort)
      const data = await Promise.race([
        cursor.toArray(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
      ]) as any
      return { success: true, data }
    }

    if (config.type === 'redis') {
      const client = await getRedisClient(config)
      // For Redis, support basic commands
      const parts = query.trim().split(/\s+/)
      const cmd = parts[0].toUpperCase()
      if (cmd === 'GET' && parts[1]) {
        const val = await Promise.race([
          client.get(parts[1]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
        ]) as any
        return { success: true, data: [{ key: parts[1], value: val }] }
      } else if (cmd === 'KEYS' && parts[1]) {
        const keys = await Promise.race([
          client.keys(parts[1]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
        ]) as any
        return { success: true, data: keys.map((k: string) => ({ key: k })) }
      } else if (cmd === 'HGETALL' && parts[1]) {
        const val = await Promise.race([
          client.hGetAll(parts[1]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
        ]) as any
        return { success: true, data: Object.entries(val).map(([field, value]) => ({ field, value })) }
      } else {
        // Try sending as a generic command
        const result = await Promise.race([
          client.sendCommand(parts),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
        ]) as any
        return { success: true, data: Array.isArray(result) ? result : [{ result: String(result) }] }
      }
    }

    const pool = getConnectionPool(config, database)
    const [rows] = await Promise.race([
      pool.query(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 30s')), 30000))
    ]) as any
    return { success: true, data: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-structure', async (_event, config, database, tableName) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      const rows = db.prepare(`PRAGMA table_info("${tableName}")`).all()
      return { success: true, structure: rows }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const result = await pool.query(
        `SELECT column_name as "Field", data_type as "Type",
         CASE WHEN is_nullable = 'YES' THEN 'YES' ELSE 'NO' END as "Null",
         '' as "Key",
         column_default as "Default", '' as "Extra"
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      )
      return { success: true, structure: result.rows }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const result = await conn.execute(
        `SELECT column_name, data_type, data_length, nullable, data_default
         FROM user_tab_columns WHERE table_name = :tableName ORDER BY column_id`,
        [tableName]
      )
      await conn.close()
      return {
        success: true,
        structure: (result.rows || []).map((r: any) => ({
          Field: r[0], Type: `${r[1]}(${r[2]})`, Null: r[3] === 'Y' ? 'YES' : 'NO', Key: '', Default: r[4], Extra: ''
        }))
      }
    }

    if (config.type === 'sqlserver') {
      const data = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database, encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest(
            `SELECT COLUMN_NAME as Field, DATA_TYPE as Type, CHARACTER_MAXIMUM_LENGTH as Length,
             IS_NULLABLE as Null, COLUMN_DEFAULT as Default
             FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName.replace(/'/g, "''")}'
             ORDER BY ORDINAL_POSITION`,
            (err2: any) => {
              if (err2) reject(err2)
              else { conn.close(); resolve(rows) }
            }
          )
          req.on('row', (cols: any[]) => {
            const row: any = {}
            cols.forEach(col => { row[col.metadata.colName] = col.value })
            rows.push(row)
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, structure: data }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const db = client.db(database)
      // Get schema by sampling a document
      const sample = await db.collection(tableName).findOne()
      const structure = sample ? Object.entries(sample).map(([key, val]) => ({
        Field: key,
        Type: val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val,
        Null: 'YES', Key: '', Default: null, Extra: ''
      })) : []
      return { success: true, structure }
    }

    if (config.type === 'redis') {
      // Redis doesn't have table structure
      return { success: true, structure: [{ Field: 'key', Type: 'string', Null: 'NO', Key: '', Default: null, Extra: '' }] }
    }

    if (!isValidIdentifier(database) || !isValidIdentifier(tableName)) {
      return { success: false, message: 'Invalid database or table name' }
    }
    const pool = getConnectionPool(config, database)
    const [rows] = await pool.query(`DESCRIBE \`${tableName}\``)
    return { success: true, structure: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-data', async (_event, config, database, tableName, limit = 1000, offset = 0) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
      const rows = db.prepare(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`).all(safeLimit, safeOffset)
      return { success: true, data: rows }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
      const result = await pool.query(
        `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
        [safeLimit, safeOffset]
      )
      return { success: true, data: result.rows }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
      const result = await conn.execute(
        `SELECT * FROM "${tableName}" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        { offset: safeOffset, limit: safeLimit }
      )
      await conn.close()
      const columns = result.metaData?.map((m: any) => m.name) || []
      const data = result.rows?.map((row: any[]) => {
        const obj: any = {}
        columns.forEach((col: string, i: number) => { obj[col] = row[i] })
        return obj
      }) || []
      return { success: true, data }
    }

    if (config.type === 'sqlserver') {
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
      const data = await new Promise<any[]>((resolve, reject) => {
        const rows: any[] = []
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database, encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest(
            `SELECT * FROM [${tableName.replace(/]/g, ']]')}] ORDER BY (SELECT NULL) OFFSET ${safeOffset} ROWS FETCH NEXT ${safeLimit} ROWS ONLY`,
            (err2: any) => {
              if (err2) reject(err2)
              else { conn.close(); resolve(rows) }
            }
          )
          req.on('row', (cols: any[]) => {
            const row: any = {}
            cols.forEach(col => { row[col.metadata.colName] = col.value })
            rows.push(row)
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return { success: true, data }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const db = client.db(database)
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
      const data = await db.collection(tableName).find({}).skip(safeOffset).limit(safeLimit).toArray()
      return { success: true, data }
    }

    if (config.type === 'redis') {
      const client = await getRedisClient(config)
      const keys = await client.keys(`${tableName}:*`)
      const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
      const limitedKeys = keys.slice(0, safeLimit)
      const data = []
      for (const key of limitedKeys) {
        const type = await client.type(key)
        let value: any = null
        if (type === 'string') value = await client.get(key)
        else if (type === 'hash') value = await client.hGetAll(key)
        else if (type === 'list') value = await client.lRange(key, 0, -1)
        else if (type === 'set') value = await client.sMembers(key)
        else if (type === 'zset') value = await client.zRange(key, 0, -1)
        data.push({ key, type, value: JSON.stringify(value) })
      }
      return { success: true, data }
    }

    if (!isValidIdentifier(database) || !isValidIdentifier(tableName)) {
      return { success: false, message: 'Invalid database or table name' }
    }
    const safeLimit = Math.max(1, Math.floor(Number(limit) || 1000))
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
    const pool = getConnectionPool(config, database)
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [safeLimit, safeOffset])
    return { success: true, data: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-info', async (_event, config, database, tableName) => {
  try {
    // SQLite handler
    if (config.type === 'sqlite') {
      const db = getSqliteConnection(config)
      // SQLite doesn't have the same metadata as MySQL, so we provide basic info
      db.prepare(`PRAGMA table_info("${tableName}")`).all()
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get() as any
      return {
        success: true,
        info: {
          ENGINE: 'SQLite',
          TABLE_ROWS: countResult?.count || 0,
          CREATE_TIME: null,
          UPDATE_TIME: null,
          TABLE_COLLATION: null,
          ROW_FORMAT: null
        }
      }
    }

    if (config.type === 'postgresql') {
      const pool = getPgPool(config, database)
      const countResult = await pool.query(
        'SELECT reltuples::bigint AS estimate_count FROM pg_class WHERE relname = $1',
        [tableName]
      )
      return {
        success: true,
        info: {
          ENGINE: 'PostgreSQL',
          TABLE_ROWS: countResult.rows[0]?.estimate_count || 0,
          CREATE_TIME: null,
          UPDATE_TIME: null,
          TABLE_COLLATION: null,
          ROW_FORMAT: null
        }
      }
    }

    if (config.type === 'oracle') {
      const pool = getOraclePool(config)
      const conn = await pool.getConnection()
      const countResult = await conn.execute(`SELECT COUNT(*) as cnt FROM "${tableName}"`)
      await conn.close()
      return {
        success: true,
        info: {
          ENGINE: 'Oracle',
          TABLE_ROWS: countResult.rows?.[0]?.[0] || 0,
          CREATE_TIME: null, UPDATE_TIME: null, TABLE_COLLATION: null, ROW_FORMAT: null
        }
      }
    }

    if (config.type === 'sqlserver') {
      const data = await new Promise<any>((resolve, reject) => {
        const auth: any = {}
        if (config.authType === 'windows') {
          auth.authentication = { type: 'ntlm', options: { domain: config.domain || '', userName: config.username || '', password: config.password || '' } }
        } else { auth.userName = config.username; auth.password = config.password }
        const conn = new TediousConnection({
          server: config.host,
          options: { port: Number(config.port) || 1433, database, encrypt: true, trustServerCertificate: true },
          ...auth,
        })
        conn.on('connect', (err: any) => {
          if (err) return reject(err)
          const req = new TediousRequest(
            `SELECT p.rows AS TABLE_ROWS FROM sys.tables t INNER JOIN sys.partitions p ON t.object_id = p.object_id WHERE t.name = '${tableName.replace(/'/g, "''")}' AND p.index_id IN (0, 1)`,
            (err2: any) => {
              if (err2) reject(err2)
              else { conn.close(); resolve(result) }
            }
          )
          let result: any = { TABLE_ROWS: 0 }
          req.on('row', (cols: any[]) => {
            cols.forEach(col => { if (col.metadata.colName === 'TABLE_ROWS') result.TABLE_ROWS = col.value })
          })
          conn.execSql(req)
        })
        conn.on('error', (err: any) => reject(err))
      })
      return {
        success: true,
        info: {
          ENGINE: 'SQL Server',
          TABLE_ROWS: data.TABLE_ROWS || 0,
          CREATE_TIME: null, UPDATE_TIME: null, TABLE_COLLATION: null, ROW_FORMAT: null
        }
      }
    }

    if (config.type === 'mongodb') {
      const client = await getMongoClient(config)
      const db = client.db(database)
      const count = await db.collection(tableName).estimatedDocumentCount()
      return {
        success: true,
        info: {
          ENGINE: 'MongoDB',
          TABLE_ROWS: count,
          CREATE_TIME: null, UPDATE_TIME: null, TABLE_COLLATION: null, ROW_FORMAT: null
        }
      }
    }

    if (config.type === 'redis') {
      const client = await getRedisClient(config)
      const count = await client.dbSize()
      return {
        success: true,
        info: {
          ENGINE: 'Redis',
          TABLE_ROWS: count,
          CREATE_TIME: null, UPDATE_TIME: null, TABLE_COLLATION: null, ROW_FORMAT: null
        }
      }
    }

    const pool = getConnectionPool(config)
    const [rows] = await pool.query(
      `SELECT ENGINE, ROW_FORMAT, TABLE_ROWS, CREATE_TIME, UPDATE_TIME, TABLE_COLLATION
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [database, tableName]
    )
    return { success: true, info: (rows as any[])[0] || null }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // Clean up MySQL connection pools
  connectionPool.forEach(pool => {
    pool.end().catch(err => console.error('Error closing pool:', err))
  })
  connectionPool.clear()

  // Clean up SQLite connections
  sqliteConnections.forEach(db => {
    try {
      db.close()
    } catch (err) {
      console.error('Error closing SQLite connection:', err)
    }
  })
  sqliteConnections.clear()

  // Clean up PostgreSQL pools
  pgPools.forEach(pool => {
    pool.end().catch(err => console.error('Error closing PG pool:', err))
  })
  pgPools.clear()

  // Clean up Oracle pools
  oraclePools.forEach(pool => {
    try { pool.close(0) } catch (err) { console.error('Error closing Oracle pool:', err) }
  })
  oraclePools.clear()

  // Clean up MongoDB clients
  mongoClients.forEach(client => {
    client.close().catch((err: any) => console.error('Error closing MongoDB client:', err))
  })
  mongoClients.clear()

  // Clean up Redis clients
  redisClients.forEach(client => {
    client.disconnect().catch((err: any) => console.error('Error closing Redis client:', err))
  })
  redisClients.clear()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit
app.on('before-quit', () => {
  // Close all database connections
  connectionPool.forEach(pool => {
    pool.end().catch(err => console.error('Error closing pool:', err))
  })
  connectionPool.clear()

  // Close all SQLite connections
  sqliteConnections.forEach(db => {
    try {
      db.close()
    } catch (err) {
      console.error('Error closing SQLite connection:', err)
    }
  })
  sqliteConnections.clear()

  // Close all PostgreSQL pools
  pgPools.forEach(pool => {
    pool.end().catch(err => console.error('Error closing PG pool:', err))
  })
  pgPools.clear()

  // Clean up Oracle pools
  oraclePools.forEach(pool => {
    try { pool.close(0) } catch (err) { console.error('Error closing Oracle pool:', err) }
  })
  oraclePools.clear()

  // Clean up MongoDB clients
  mongoClients.forEach(client => {
    client.close().catch((err: any) => console.error('Error closing MongoDB client:', err))
  })
  mongoClients.clear()

  // Clean up Redis clients
  redisClients.forEach(client => {
    client.disconnect().catch((err: any) => console.error('Error closing Redis client:', err))
  })
  redisClients.clear()
})
