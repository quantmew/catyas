import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { isDev } from './utils/env'
import { createMenu } from './menu'
import { DatabaseManager } from './database/DatabaseManager'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, '../preload/preload.js'),
    },
    show: false,
    titleBarStyle: 'default',
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menu = createMenu(mainWindow)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const databaseManager = new DatabaseManager()

ipcMain.handle('db:connect', async (event, config) => {
  try {
    const connection = await databaseManager.connect(config)
    return { success: true, connectionId: connection.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:disconnect', async (event, connectionId) => {
  try {
    await databaseManager.disconnect(connectionId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:query', async (event, connectionId, query) => {
  try {
    const result = await databaseManager.query(connectionId, query)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getDatabases', async (event, connectionId) => {
  try {
    const databases = await databaseManager.getDatabases(connectionId)
    return { success: true, data: databases }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getTables', async (event, connectionId, database) => {
  try {
    const tables = await databaseManager.getTables(connectionId, database)
    return { success: true, data: tables }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getTableData', async (event, connectionId, database, table, limit, offset) => {
  try {
    const data = await databaseManager.getTableData(connectionId, database, table, limit, offset)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getTablesInfo', async (event, connectionId, database) => {
  try {
    const data = await databaseManager.getTablesInfo(connectionId, database)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getTableSchema', async (event, connectionId, database, table) => {
  try {
    const data = await databaseManager.getTableSchema(connectionId, database, table)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
