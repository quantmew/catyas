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
  newTable: () => void
  newView: () => void
  newFunction: () => void
  newUser: () => void
  newOther: () => void
  newQuery: () => void
  newBackup: () => void
  newAutoRun: () => void
  newModel: () => void
  newChartWorkspace: () => void
  openExternal: () => void
  openRecent: () => void
  closeConnection: () => void
  closeWindow: () => void
  closeTab: () => void
  importConnection: () => void
  exportConnection: () => void
  exitCatyas: () => void

  // Edit
  copy: () => void
  paste: () => void
  selectAll: () => void

  // View
  navigationPane: () => void
  informationPane: () => void
  list: () => void
  details: () => void
  erDiagram: () => void
  hideObjectGroup: () => void
  sort: () => void
  selectColumns: () => void
  showHiddenItems: () => void

  // Favorites
  addToFavorites: () => void
  manageFavorites: () => void

  // Tools
  dataTransfer: () => void
  dataGeneration: () => void
  dataSynchronization: () => void
  structureSynchronization: () => void
  commandLineInterface: () => void
  serverMonitor: () => void
  findInDatabaseOrSchema: () => void
  historyLog: () => void
  options: () => void

  // Window
  minimize: () => void
  maximize: () => void
  alwaysOnTop: () => void

  // Help
  onlineDocumentation: () => void
  releaseNotes: () => void
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
        children: [
          {
            id: 'newTable',
            action: actions.newTable,
            shortcut: 'V'
          },
          {
            id: 'newView',
            action: actions.newView,
            shortcut: 'W'
          },
          {
            id: 'newFunction',
            action: actions.newFunction,
            shortcut: 'X'
          },
          {
            id: 'newUser',
            action: actions.newUser,
            shortcut: 'Y'
          },
          {
            id: 'newOther',
            action: actions.newOther,
            shortcut: 'Z'
          },
          {
            type: 'separator'
          },
          {
            id: 'newQuery',
            action: actions.newQuery
          },
          {
            id: 'newBackup',
            action: actions.newBackup
          },
          {
            id: 'newAutoRun',
            action: actions.newAutoRun
          },
          {
            id: 'newModel',
            action: actions.newModel
          },
          {
            id: 'newChartWorkspace',
            action: actions.newChartWorkspace
          }
        ]
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
    id: 'view',
    items: [
      {
        id: 'navigationPane',
        action: actions.navigationPane
      },
      {
        id: 'informationPane',
        action: actions.informationPane
      },
      {
        type: 'separator'
      },
      {
        id: 'list',
        action: actions.list
      },
      {
        id: 'details',
        action: actions.details
      },
      {
        id: 'erDiagram',
        action: actions.erDiagram
      },
      {
        type: 'separator'
      },
      {
        id: 'hideObjectGroup',
        action: actions.hideObjectGroup
      },
      {
        id: 'sort',
        action: actions.sort
      },
      {
        id: 'selectColumns',
        action: actions.selectColumns
      },
      {
        type: 'separator'
      },
      {
        id: 'showHiddenItems',
        action: actions.showHiddenItems
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
        id: 'dataTransfer',
        action: actions.dataTransfer
      },
      {
        id: 'dataGeneration',
        action: actions.dataGeneration
      },
      {
        id: 'dataSynchronization',
        action: actions.dataSynchronization
      },
      {
        id: 'structureSynchronization',
        action: actions.structureSynchronization
      },
      {
        type: 'separator'
      },
      {
        id: 'commandLineInterface',
        action: actions.commandLineInterface,
        shortcut: 'F6'
      },
      {
        id: 'serverMonitor',
        action: actions.serverMonitor
      },
      {
        type: 'separator'
      },
      {
        id: 'findInDatabaseOrSchema',
        action: actions.findInDatabaseOrSchema
      },
      {
        id: 'historyLog',
        action: actions.historyLog,
        shortcut: 'Ctrl+L'
      },
      {
        type: 'separator'
      },
      {
        id: 'options',
        action: actions.options
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
        id: 'onlineDocumentation',
        action: actions.onlineDocumentation
      },
      {
        id: 'releaseNotes',
        action: actions.releaseNotes
      },
      {
        type: 'separator'
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
