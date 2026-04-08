import * as Menubar from '@radix-ui/react-menubar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTranslation } from 'react-i18next'
import { createMenuBarConfig, MenuBarActions, MenuItem, MenuSeparator } from './topBarConfig'
import { useMemo } from 'react'
import {
  Database,
  Table,
  Eye,
  FileCode,
  User,
  Wrench,
  Play,
  Upload,
  Bot,
  GitBranch,
  BarChart3,
  ChevronDown,
  FileText
} from 'lucide-react'

const isSeparator = (item: MenuItem | MenuSeparator): item is MenuSeparator => {
  return 'type' in item && item.type === 'separator'
}

const databaseTypes = [
  { type: 'mysql', label: 'MySQL', icon: Database },
  { type: 'postgresql', label: 'PostgreSQL', icon: Database },
  { type: 'oracle', label: 'Oracle', icon: Database },
  { type: 'sqlite', label: 'SQLite', icon: Database },
  { type: 'sqlserver', label: 'SQL Server', icon: Database },
  { type: 'mariadb', label: 'MariaDB', icon: Database },
  { type: 'mongodb', label: 'MongoDB', icon: Database },
  { type: 'redis', label: 'Redis', icon: Database }
]

interface RibbonButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  active?: boolean
}

function RibbonButton({ icon: Icon, label, onClick, active }: RibbonButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] px-2 rounded transition-colors ${
        active
          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-[12px] leading-none whitespace-nowrap">{label}</span>
    </button>
  )
}

interface RibbonButtonWithDropdownProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: (dbType: string) => void
  active?: boolean
}

function RibbonButtonWithDropdown({ icon: Icon, label, onClick, active }: RibbonButtonWithDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] px-2 rounded transition-colors ${
            active
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-1">
            <Icon className="w-6 h-6" />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-[12px] leading-none whitespace-nowrap mt-0.5">{label}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="min-w-[180px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 rounded z-50"
        >
          {databaseTypes.map((db) => (
            <DropdownMenu.Item
              key={db.type}
              onSelect={() => onClick?.(db.type)}
              className="outline-none px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default text-gray-700 dark:text-gray-200"
            >
              {db.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

interface TopRibbonProps {
  onNewConnection?: (dbType: string) => void
  onOpenOptions?: () => void
  onNewQuery?: () => void
  onRefresh?: () => void
  onDataTransfer?: () => void
}

export default function TopRibbon({ onNewConnection, onOpenOptions, onNewQuery, onRefresh, onDataTransfer }: TopRibbonProps) {
  const { t } = useTranslation()

  const actions: MenuBarActions = useMemo(() => ({
    // File
    newProject: () => {
      onNewConnection?.('mysql')
    },
    newConnection: (dbType: string) => {
      onNewConnection?.(dbType)
    },
    new: () => onNewConnection?.('mysql'),
    newTable: () => alert(t('ribbon.table')),
    newView: () => alert(t('menu.newView')),
    newFunction: () => alert(t('menu.newFunction')),
    newUser: () => alert(t('menu.newUser')),
    newOther: () => alert(t('menu.newOther')),
    newQuery: () => onNewQuery?.(),
    newBackup: () => alert(t('menu.newBackup')),
    newAutoRun: () => alert(t('menu.newAutoRun')),
    newModel: () => alert(t('menu.newModel')),
    newChartWorkspace: () => alert(t('menu.newChartWorkspace')),
    openExternal: () => alert(t('menu.openExternal')),
    openRecent: () => alert(t('menu.openRecent')),
    closeConnection: () => alert(t('menu.closeConnection')),
    closeWindow: () => window.electronAPI?.closeWindow(),
    closeTab: () => alert(t('menu.closeTab')),
    importConnection: () => alert(t('menu.importConnection')),
    exportConnection: () => alert(t('menu.exportConnection')),
    exitCatyas: () => window.electronAPI?.closeWindow(),

    // Edit - use browser native functionality
    copy: () => document.execCommand('copy'),
    paste: () => document.execCommand('paste'),
    selectAll: () => document.execCommand('selectAll'),

    // View
    navigationPane: () => alert(t('menu.navigationPane')),
    informationPane: () => alert(t('menu.informationPane')),
    list: () => alert(t('menu.list')),
    details: () => alert(t('menu.details')),
    erDiagram: () => alert(t('menu.erDiagram')),
    hideObjectGroup: () => alert(t('menu.hideObjectGroup')),
    sort: () => alert(t('menu.sort')),
    selectColumns: () => alert(t('menu.selectColumns')),
    showHiddenItems: () => alert(t('menu.showHiddenItems')),

    // Favorites
    addToFavorites: () => alert(t('menu.addToFavorites')),
    manageFavorites: () => alert(t('menu.manageFavorites')),

    // Tools
    dataTransfer: () => onDataTransfer?.(),
    dataGeneration: () => alert(t('menu.dataGeneration')),
    dataSynchronization: () => alert(t('menu.dataSynchronization')),
    structureSynchronization: () => alert(t('menu.structureSynchronization')),
    commandLineInterface: () => alert(t('menu.commandLineInterface')),
    serverMonitor: () => alert(t('menu.serverMonitor')),
    findInDatabaseOrSchema: () => alert(t('menu.findInDatabaseOrSchema')),
    historyLog: () => alert(t('menu.historyLog')),
    options: () => onOpenOptions?.(),

    // Window
    minimize: () => window.electronAPI?.minimizeWindow(),
    maximize: () => window.electronAPI?.maximizeWindow(),
    alwaysOnTop: () => window.electronAPI?.setAlwaysOnTop(true),

    // Help
    onlineDocumentation: () => window.electronAPI?.openExternal('https://github.com/catyas/catyas'),
    releaseNotes: () => window.electronAPI?.openExternal('https://github.com/catyas/catyas/releases'),
    about: async () => {
      const info = await window.electronAPI?.getAppInfo()
      alert(`Catyas\nVersion: ${info?.version}\n\nA modern database connection manager`)
    },

    // Ribbon buttons
    refresh: () => onRefresh?.(),
    table: () => alert(t('ribbon.table')),
    users: () => alert(t('ribbon.users')),
    query: () => onNewQuery?.(),
    import: () => alert(t('menu.importConnection')),
    settings: () => onOpenOptions?.()
  }), [onNewConnection, onOpenOptions, onNewQuery, onRefresh, onDataTransfer, t])

  const menuBarConfig = useMemo(() => createMenuBarConfig(actions), [actions])

  const renderMenuItem = (item: MenuItem): JSX.Element => {
    if (item.children && item.children.length > 0) {
      return (
        <Menubar.Sub key={item.id}>
          <Menubar.SubTrigger className="outline-none w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed flex items-center justify-between">
            <span>{t(`menu.${item.id}`)}</span>
            <span className="ml-8">▶</span>
          </Menubar.SubTrigger>
          <Menubar.Portal>
            <Menubar.SubContent className="min-w-[220px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 rounded">
              {item.children.map((childItem, index) => {
                if (isSeparator(childItem)) {
                  return (
                    <Menubar.Separator
                      key={`separator-${index}`}
                      className="h-px bg-gray-200 dark:bg-gray-700 my-1"
                    />
                  )
                }
                return renderMenuItem(childItem)
              })}
            </Menubar.SubContent>
          </Menubar.Portal>
        </Menubar.Sub>
      )
    }

    return (
      <Menubar.Item
        key={item.id}
        onSelect={() => item.action?.()}
        disabled={item.disabled}
        className="outline-none w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed flex items-center justify-between"
      >
        <span>{t(`menu.${item.id}`)}</span>
        {item.shortcut && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-8">{item.shortcut}</span>
        )}
      </Menubar.Item>
    )
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 select-none app-no-drag">
      {/* Menu Bar */}
      <Menubar.Root className="h-8 px-2 flex items-center text-[13px] text-gray-800 dark:text-gray-200 space-x-1">
        {menuBarConfig.map((menuGroup) => (
          <Menubar.Menu key={menuGroup.id}>
            <Menubar.Trigger className="px-2.5 h-8 rounded data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
              {t(`menu.${menuGroup.id}`)}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content align="start" className="min-w-[220px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-40 rounded">
                {menuGroup.items.map((item, index) => {
                  if (isSeparator(item)) {
                    return (
                      <Menubar.Separator
                        key={`separator-${index}`}
                        className="h-px bg-gray-200 dark:bg-gray-700 my-1"
                      />
                    )
                  }
                  return renderMenuItem(item)
                })}
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
      </Menubar.Root>

      {/* Ribbon Toolbar - redesigned to match Navicat style */}
      <div className="h-[76px] px-2 flex items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        {/* Connection button with dropdown */}
        <div className="flex items-center">
          <RibbonButtonWithDropdown
            icon={Database}
            label={t('ribbon.newConnection')}
            onClick={(dbType) => onNewConnection?.(dbType)}
          />
        </div>

        {/* New Query button */}
        <div className="flex items-center">
          <RibbonButton
            icon={FileText}
            label={t('ribbon.newQuery')}
            onClick={actions.newQuery}
          />
        </div>

        {/* Table */}
        <div className="flex items-center">
          <RibbonButton
            icon={Table}
            label={t('ribbon.table')}
            onClick={actions.table}
            active={true}
          />
        </div>

        {/* View */}
        <div className="flex items-center">
          <RibbonButton
            icon={Eye}
            label={t('menu.newView')}
            onClick={actions.newView}
          />
        </div>

        {/* Function */}
        <div className="flex items-center">
          <RibbonButton
            icon={FileCode}
            label={t('menu.newFunction')}
            onClick={actions.newFunction}
          />
        </div>

        {/* User */}
        <div className="flex items-center">
          <RibbonButton
            icon={User}
            label={t('ribbon.users')}
            onClick={actions.users}
          />
        </div>

        {/* Other - dropdown */}
        <div className="flex items-center">
          <RibbonButton
            icon={Wrench}
            label={t('menu.newOther')}
            onClick={actions.newOther}
          />
        </div>

        {/* Query */}
        <div className="flex items-center">
          <RibbonButton
            icon={Play}
            label={t('ribbon.query')}
            onClick={actions.query}
          />
        </div>

        {/* Backup */}
        <div className="flex items-center">
          <RibbonButton
            icon={Upload}
            label={t('menu.newBackup')}
            onClick={actions.newBackup}
          />
        </div>

        {/* Auto Run */}
        <div className="flex items-center">
          <RibbonButton
            icon={Bot}
            label={t('menu.newAutoRun')}
            onClick={actions.newAutoRun}
          />
        </div>

        {/* Model */}
        <div className="flex items-center">
          <RibbonButton
            icon={GitBranch}
            label={t('menu.newModel')}
            onClick={actions.newModel}
          />
        </div>

        {/* Chart */}
        <div className="flex items-center">
          <RibbonButton
            icon={BarChart3}
            label={t('menu.newChartWorkspace')}
            onClick={actions.newChartWorkspace}
          />
        </div>
      </div>
    </div>
  )
}
