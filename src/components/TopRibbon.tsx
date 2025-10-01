import * as Menubar from '@radix-ui/react-menubar'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { createMenuBarConfig, createRibbonConfig, MenuBarActions, MenuItem, MenuSeparator, RibbonButton as RibbonButtonConfig } from './topBarConfig'
import { useMemo } from 'react'

const isSeparator = (item: MenuItem | MenuSeparator): item is MenuSeparator => {
  return 'type' in item && item.type === 'separator'
}

function RibbonButton({ config }: { config: RibbonButtonConfig }) {
  const { t } = useTranslation()
  const Icon = config.icon

  return (
    <button
      onClick={config.action}
      className="flex flex-col items-center justify-center w-16 h-14 mx-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
      title={t(`ribbon.${config.id}`)}
    >
      <Icon className="w-5 h-5 mb-0.5" />
      <span className="text-[11px] leading-none">{t(`ribbon.${config.id}`)}</span>
    </button>
  )
}

interface TopRibbonProps {
  onNewConnection?: (dbType: string) => void
}

export default function TopRibbon({ onNewConnection }: TopRibbonProps) {
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
    new: () => console.log('[Ribbon] New'),
    openExternal: () => console.log('[Menu] Open External'),
    openRecent: () => console.log('[Menu] Open Recent'),
    closeConnection: () => console.log('[Menu] Close Connection'),
    closeWindow: () => console.log('[Menu] Close Window'),
    closeTab: () => console.log('[Menu] Close Tab'),
    importConnection: () => console.log('[Menu] Import Connection'),
    exportConnection: () => console.log('[Menu] Export Connection'),
    exitCatyas: () => window.close(),

    // Edit
    undo: () => console.log('[Edit] Undo'),
    redo: () => console.log('[Edit] Redo'),
    cut: () => console.log('[Edit] Cut'),
    copy: () => console.log('[Edit] Copy'),
    paste: () => console.log('[Edit] Paste'),
    selectAll: () => console.log('[Edit] Select All'),

    // Favorites
    addToFavorites: () => console.log('[Favorites] Add to Favorites'),
    manageFavorites: () => console.log('[Favorites] Manage Favorites'),

    // Tools
    structureSync: () => console.log('[Tools] Structure Sync'),
    dataTransfer: () => console.log('[Tools] Data Transfer'),
    backup: () => console.log('[Tools] Backup'),
    scheduledTasks: () => console.log('[Tools] Scheduled Tasks'),

    // Window - these are now handled by native controls
    minimize: () => console.log('[Window] Minimize (native)'),
    maximize: () => console.log('[Window] Maximize (native)'),
    alwaysOnTop: () => console.log('[Window] Always on Top'),

    // Help
    viewHelp: () => console.log('[Help] View Help'),
    checkUpdates: () => console.log('[Help] Check Updates'),
    about: () => console.log('[Help] About'),

    // Ribbon buttons
    refresh: () => console.log('[Ribbon] Refresh'),
    table: () => console.log('[Ribbon] Table'),
    users: () => console.log('[Ribbon] Users'),
    query: () => console.log('[Ribbon] Query'),
    import: () => console.log('[Ribbon] Import'),
    settings: () => console.log('[Ribbon] Settings')
  }), [onNewConnection])

  const menuBarConfig = useMemo(() => createMenuBarConfig(actions), [actions])
  const ribbonConfig = useMemo(() => createRibbonConfig(actions), [actions])

  const renderMenuItem = (item: MenuItem): JSX.Element => {
    // If item has children, render as submenu
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

    // Regular menu item
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
      <Menubar.Root className="h-8 px-1 flex items-center text-[13px] text-gray-800 dark:text-gray-200 space-x-1">
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

      <div className="h-12 px-2 flex items-center justify-between overflow-x-auto border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          {ribbonConfig.map((group: import('./topBarConfig').RibbonGroup, groupIndex: number) => (
            <div
              key={groupIndex}
              className={`flex items-center ${groupIndex < ribbonConfig.length - 1 ? 'pr-3 mr-3 border-r border-gray-200 dark:border-gray-700' : ''}`}
            >
              {group.buttons.map((button: RibbonButtonConfig) => (
                <RibbonButton key={button.id} config={button} />
              ))}
            </div>
          ))}
        </div>
        <div className="mr-2">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
