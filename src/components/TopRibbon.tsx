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
}

export default function TopRibbon({ onNewConnection, onOpenOptions }: TopRibbonProps) {
  const { t } = useTranslation()

  const actions: MenuBarActions = useMemo(() => ({
    // File
    newProject: () => {
      console.log('[Ribbon] New Connection')
      onNewConnection?.('mysql')
    },
    newConnection: (dbType: string) => {
      console.log('[Menu] New Connection -', dbType.toUpperCase())
      onNewConnection?.(dbType)
    },
    new: () => console.log('[Menu] New'),
    newTable: () => console.log('[Menu] New Table'),
    newView: () => console.log('[Menu] New View'),
    newFunction: () => console.log('[Menu] New Function'),
    newUser: () => console.log('[Menu] New User'),
    newOther: () => console.log('[Menu] New Other'),
    newQuery: () => console.log('[Menu] New Query'),
    newBackup: () => console.log('[Menu] New Backup'),
    newAutoRun: () => console.log('[Menu] New Auto Run'),
    newModel: () => console.log('[Menu] New Model'),
    newChartWorkspace: () => console.log('[Menu] New Chart Workspace'),
    openExternal: () => console.log('[Menu] Open External'),
    openRecent: () => console.log('[Menu] Open Recent'),
    closeConnection: () => console.log('[Menu] Close Connection'),
    closeWindow: () => console.log('[Menu] Close Window'),
    closeTab: () => console.log('[Menu] Close Tab'),
    importConnection: () => console.log('[Menu] Import Connection'),
    exportConnection: () => console.log('[Menu] Export Connection'),
    exitCatyas: () => window.close(),

    // Edit
    copy: () => console.log('[Edit] Copy'),
    paste: () => console.log('[Edit] Paste'),
    selectAll: () => console.log('[Edit] Select All'),

    // View
    navigationPane: () => console.log('[View] Navigation Pane'),
    informationPane: () => console.log('[View] Information Pane'),
    list: () => console.log('[View] List'),
    details: () => console.log('[View] Details'),
    erDiagram: () => console.log('[View] ER Diagram'),
    hideObjectGroup: () => console.log('[View] Hide Object Group'),
    sort: () => console.log('[View] Sort'),
    selectColumns: () => console.log('[View] Select Columns'),
    showHiddenItems: () => console.log('[View] Show Hidden Items'),

    // Favorites
    addToFavorites: () => console.log('[Favorites] Add to Favorites'),
    manageFavorites: () => console.log('[Favorites] Manage Favorites'),

    // Tools
    dataTransfer: () => console.log('[Tools] Data Transfer'),
    dataGeneration: () => console.log('[Tools] Data Generation'),
    dataSynchronization: () => console.log('[Tools] Data Synchronization'),
    structureSynchronization: () => console.log('[Tools] Structure Synchronization'),
    commandLineInterface: () => console.log('[Tools] Command Line Interface'),
    serverMonitor: () => console.log('[Tools] Server Monitor'),
    findInDatabaseOrSchema: () => console.log('[Tools] Find in Database or Schema'),
    historyLog: () => console.log('[Tools] History Log'),
    options: () => onOpenOptions?.(),

    // Window
    minimize: () => console.log('[Window] Minimize (native)'),
    maximize: () => console.log('[Window] Maximize (native)'),
    alwaysOnTop: () => console.log('[Window] Always on Top'),

    // Help
    onlineDocumentation: () => console.log('[Help] Online Documentation'),
    releaseNotes: () => console.log('[Help] Release Notes'),
    about: () => console.log('[Help] About'),

    // Ribbon buttons
    refresh: () => console.log('[Ribbon] Refresh'),
    table: () => console.log('[Ribbon] Table'),
    users: () => console.log('[Ribbon] Users'),
    query: () => console.log('[Ribbon] Query'),
    import: () => console.log('[Ribbon] Import'),
    settings: () => onOpenOptions?.()
  }), [onNewConnection, onOpenOptions])

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
