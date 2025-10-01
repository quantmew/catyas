import { LucideIcon, Database, FolderPlus, RefreshCw, Table2, Users, Play, FileUp, Settings } from 'lucide-react'

export interface MenuSeparator {
  type: 'separator'
}

export interface MenuItem {
  id: string
  action?: () => void
  shortcut?: string
  disabled?: boolean
  children?: (MenuItem | MenuSeparator)[]
}

export interface MenuGroup {
  id: string
  items: (MenuItem | MenuSeparator)[]
}

export interface RibbonButton {
  id: string
  icon: LucideIcon
  action: () => void
}

export interface RibbonGroup {
  buttons: RibbonButton[]
}

export interface MenuBarActions {
  // File
  newProject: () => void
  newConnection: (dbType: string) => void
  new: () => void
  openExternal: () => void
  openRecent: () => void
  closeConnection: () => void
  closeWindow: () => void
  closeTab: () => void
  importConnection: () => void
  exportConnection: () => void
  exitCatyas: () => void

  // Edit
  undo: () => void
  redo: () => void
  cut: () => void
  copy: () => void
  paste: () => void
  selectAll: () => void

  // Favorites
  addToFavorites: () => void
  manageFavorites: () => void

  // Tools
  structureSync: () => void
  dataTransfer: () => void
  backup: () => void
  scheduledTasks: () => void

  // Window
  minimize: () => void
  maximize: () => void
  alwaysOnTop: () => void

  // Help
  viewHelp: () => void
  checkUpdates: () => void
  about: () => void

  // Ribbon buttons
  refresh: () => void
  table: () => void
  users: () => void
  query: () => void
  import: () => void
  settings: () => void
}

export const createMenuBarConfig = (actions: MenuBarActions): MenuGroup[] => [
  {
    id: 'file',
    items: [
      {
        id: 'newProject',
        action: actions.newProject
      },
      {
        id: 'newConnection',
        children: [
          {
            id: 'newConnectionMySQL',
            action: () => actions.newConnection('mysql')
          },
          {
            id: 'newConnectionPostgreSQL',
            action: () => actions.newConnection('postgresql')
          },
          {
            id: 'newConnectionOracle',
            action: () => actions.newConnection('oracle')
          },
          {
            id: 'newConnectionSQLite',
            action: () => actions.newConnection('sqlite')
          },
          {
            id: 'newConnectionSQLServer',
            action: () => actions.newConnection('sqlserver')
          },
          {
            id: 'newConnectionMariaDB',
            action: () => actions.newConnection('mariadb')
          },
          {
            id: 'newConnectionMongoDB',
            action: () => actions.newConnection('mongodb')
          },
          {
            id: 'newConnectionRedis',
            action: () => actions.newConnection('redis')
          }
        ]
      },
      {
        id: 'new',
        action: actions.new
      },
      {
        type: 'separator'
      },
      {
        id: 'openExternal',
        action: actions.openExternal
      },
      {
        id: 'openRecent',
        action: actions.openRecent,
        disabled: true
      },
      {
        type: 'separator'
      },
      {
        id: 'closeConnection',
        action: actions.closeConnection,
        disabled: true
      },
      {
        id: 'closeWindow',
        action: actions.closeWindow
      },
      {
        id: 'closeTab',
        action: actions.closeTab,
        disabled: true
      },
      {
        type: 'separator'
      },
      {
        id: 'importConnection',
        action: actions.importConnection
      },
      {
        id: 'exportConnection',
        action: actions.exportConnection
      },
      {
        type: 'separator'
      },
      {
        id: 'exitCatyas',
        action: actions.exitCatyas
      }
    ]
  },
  {
    id: 'edit',
    items: [
      {
        id: 'undo',
        action: actions.undo,
        shortcut: 'Ctrl+Z'
      },
      {
        id: 'redo',
        action: actions.redo,
        shortcut: 'Ctrl+Y'
      },
      {
        type: 'separator'
      },
      {
        id: 'cut',
        action: actions.cut,
        shortcut: 'Ctrl+X'
      },
      {
        id: 'copy',
        action: actions.copy,
        shortcut: 'Ctrl+C'
      },
      {
        id: 'paste',
        action: actions.paste,
        shortcut: 'Ctrl+V'
      },
      {
        type: 'separator'
      },
      {
        id: 'selectAll',
        action: actions.selectAll,
        shortcut: 'Ctrl+A'
      }
    ]
  },
  {
    id: 'favorites',
    items: [
      {
        id: 'addToFavorites',
        action: actions.addToFavorites
      },
      {
        id: 'manageFavorites',
        action: actions.manageFavorites
      }
    ]
  },
  {
    id: 'tools',
    items: [
      {
        id: 'structureSync',
        action: actions.structureSync
      },
      {
        id: 'dataTransfer',
        action: actions.dataTransfer
      },
      {
        id: 'backup',
        action: actions.backup
      },
      {
        id: 'scheduledTasks',
        action: actions.scheduledTasks
      }
    ]
  },
  {
    id: 'window',
    items: [
      {
        id: 'minimize',
        action: actions.minimize
      },
      {
        id: 'maximize',
        action: actions.maximize
      },
      {
        type: 'separator'
      },
      {
        id: 'alwaysOnTop',
        action: actions.alwaysOnTop
      }
    ]
  },
  {
    id: 'help',
    items: [
      {
        id: 'viewHelp',
        action: actions.viewHelp,
        shortcut: 'F1'
      },
      {
        type: 'separator'
      },
      {
        id: 'checkUpdates',
        action: actions.checkUpdates
      },
      {
        id: 'about',
        action: actions.about
      }
    ]
  }
]

export const createRibbonConfig = (actions: MenuBarActions): RibbonGroup[] => {
  return [
    {
      buttons: [
        { id: 'newConnection', icon: Database, action: actions.newProject },
        { id: 'new', icon: FolderPlus, action: actions.new },
        { id: 'refresh', icon: RefreshCw, action: actions.refresh }
      ]
    },
    {
      buttons: [
        { id: 'table', icon: Table2, action: actions.table },
        { id: 'users', icon: Users, action: actions.users },
        { id: 'query', icon: Play, action: actions.query }
      ]
    },
    {
      buttons: [
        { id: 'import', icon: FileUp, action: actions.import },
        { id: 'settings', icon: Settings, action: actions.settings }
      ]
    }
  ]
}
