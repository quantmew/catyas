import { app, BrowserWindow, ipcMain, dialog, OpenDialogOptions } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mysql from 'mysql2/promise'
import sqlite3 from 'better-sqlite3'

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
      sandbox: false
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
    const result = await dialog.showOpenDialog({
      title: '选择文件',
      filters: options?.filters || [
        { name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile'],
      ...options
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] }
    }
    return { success: false, filePath: null }
  } catch (err) {
    console.error('Failed to open file dialog:', err)
    return { success: false, filePath: null }
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

    const pool = getConnectionPool(config, database)
    const [rows] = await pool.query(query)
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
})
