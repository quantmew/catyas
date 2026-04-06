import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mysql from 'mysql2/promise'

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

// IPC Handlers
ipcMain.handle('db:test-connection', async (_event, config) => {
  console.log('[Main] Testing connection to:', config.host, config.port, config.username)
  try {
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
    const pool = getConnectionPool(config)
    const [rows] = await pool.query('SHOW DATABASES')
    return { success: true, databases: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-tables', async (_event, config, database) => {
  try {
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
    const pool = getConnectionPool(config, database)
    const [rows] = await pool.query(query)
    return { success: true, data: rows }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-structure', async (_event, config, database, tableName) => {
  try {
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
  // Clean up connection pools
  connectionPool.forEach(pool => {
    pool.end().catch(err => console.error('Error closing pool:', err))
  })
  connectionPool.clear()

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
})
