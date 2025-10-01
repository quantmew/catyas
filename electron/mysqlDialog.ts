import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let mysqlDialogWindow: BrowserWindow | null = null

export function createMySQLConnectionDialog(parentWindow: BrowserWindow, __dirname: string) {
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

  mysqlDialogWindow.once('ready-to-show', () => {
    mysqlDialogWindow?.show()
  })

  // Load the MySQL connection dialog page
  if (process.env.VITE_DEV_SERVER_URL) {
    mysqlDialogWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/mysql-connection`)
  } else {
    mysqlDialogWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/mysql-connection'
    })
  }

  mysqlDialogWindow.on('closed', () => {
    mysqlDialogWindow = null
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
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    if (parentWindow) {
      createMySQLConnectionDialog(parentWindow, __dirname)
    }
  })

  ipcMain.handle('mysql-dialog:close', () => {
    closeMySQLConnectionDialog()
  })

  ipcMain.handle('mysql-dialog:save', (_event, connectionData) => {
    // Send connection data back to main window
    const allWindows = BrowserWindow.getAllWindows()
    const mainWindowRef = allWindows.find(w => w !== mysqlDialogWindow)

    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('mysql-connection:saved', connectionData)
    }

    closeMySQLConnectionDialog()
  })
}
