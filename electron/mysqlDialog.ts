import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let mysqlDialogWindow: BrowserWindow | null = null
let mainWindowWebContentsId: number | null = null

export function createMySQLConnectionDialog(parentWindow: BrowserWindow, __dirname: string) {
  // Store main window's webContentsId
  mainWindowWebContentsId = parentWindow.webContents.id

  // If dialog already exists, focus it
  if (mysqlDialogWindow && !mysqlDialogWindow.isDestroyed()) {
    mysqlDialogWindow.focus()
    return mysqlDialogWindow
  }

  mysqlDialogWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 700,
    minHeight: 500,
    parent: parentWindow,
    modal: false,
    show: false,
    frame: true,
    title: 'MySQL Connection',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false
    },
    backgroundColor: '#1e1e1e'
  })

  // Open DevTools in development
  if (process.env.VITE_DEV_SERVER_URL) {
    mysqlDialogWindow.webContents.openDevTools()
  }

  mysqlDialogWindow.once('ready-to-show', () => {
    mysqlDialogWindow?.show()
  })

  // Load the MySQL connection dialog page
  if (process.env.VITE_DEV_SERVER_URL) {
    const url = `${process.env.VITE_DEV_SERVER_URL}#/mysql-connection`
    console.log('[MySQL Dialog] Loading URL:', url)
    mysqlDialogWindow.loadURL(url)
  } else {
    mysqlDialogWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/mysql-connection'
    })
  }

  mysqlDialogWindow.on('closed', () => {
    console.log('[MySQL Dialog] Window closed')
    mysqlDialogWindow = null
    mainWindowWebContentsId = null
  })

  return mysqlDialogWindow
}

export function closeMySQLConnectionDialog() {
  if (mysqlDialogWindow && !mysqlDialogWindow.isDestroyed()) {
    mysqlDialogWindow.close()
  }
}

export function getMySQLConnectionDialog() {
  return mysqlDialogWindow
}

export function registerMySQLDialogHandlers(__dirname: string) {
  // MySQL Dialog IPC handlers
  ipcMain.handle('mysql-dialog:open', (event) => {
    console.log('[MySQL Dialog] Open request received')
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    if (parentWindow) {
      createMySQLConnectionDialog(parentWindow, __dirname)
      return { success: true }
    }
    return { success: false, error: 'Parent window not found' }
  })

  ipcMain.handle('mysql-dialog:close', () => {
    console.log('[MySQL Dialog] Close request received')
    closeMySQLConnectionDialog()
  })

  ipcMain.handle('mysql-dialog:save', (_event, connectionData) => {
    console.log('[MySQL Dialog] Save request received', connectionData)

    // Find main window by webContentsId
    if (mainWindowWebContentsId !== null) {
      const mainWindow = BrowserWindow.fromId(mainWindowWebContentsId)

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('mysql-connection:saved', connectionData)
        console.log('[MySQL Dialog] Data sent to main window')
      } else {
        console.error('[MySQL Dialog] Main window not found or destroyed')
      }
    }

    closeMySQLConnectionDialog()
  })
}
