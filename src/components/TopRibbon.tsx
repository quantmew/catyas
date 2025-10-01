import { Database, Table2, Users, Settings, Play, FolderPlus, FileUp, RefreshCw } from 'lucide-react'
import * as Menubar from '@radix-ui/react-menubar'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import menuConfig from '../config/menuConfig.json'
import { MenuConfig, isSeparator, MenuItem } from '../types/menu'

const config = menuConfig as MenuConfig

function RibbonButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      className="flex flex-col items-center justify-center w-16 h-14 mx-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
      title={label}
    >
      <Icon className="w-5 h-5 mb-0.5" />
      <span className="text-[11px] leading-none">{label}</span>
    </button>
  )
}

export default function TopRibbon() {
  const { t } = useTranslation()

  const handleCommand = (action: string) => {
    // Handle new connection with database type
    if (action.startsWith('newConnection:')) {
      const dbType = action.split(':')[1]
      console.log('[Menu] New Connection -', dbType.toUpperCase())
      return
    }

    switch (action) {
      // File
      case 'newProject':
      case 'new':
      case 'openExternal':
      case 'openRecent':
      case 'closeConnection':
      case 'importConnection':
      case 'exportConnection':
      case 'closeWindow':
      case 'closeTab':
        console.log('[Menu]', action)
        break
      case 'exitCatyas':
        window.electronAPI?.windowControl?.close?.()
        break

      // Edit
      case 'undo':
      case 'redo':
      case 'cut':
      case 'copy':
      case 'paste':
      case 'selectAll':
        console.log('[Edit]', action)
        break

      // Favorites/Tools
      case 'addToFavorites':
      case 'manageFavorites':
      case 'structureSync':
      case 'dataTransfer':
      case 'backup':
      case 'scheduledTasks':
        console.log('[Tools]', action)
        break

      // Window
      case 'minimize':
        window.electronAPI?.windowControl?.minimize?.()
        break
      case 'maximize':
        window.electronAPI?.windowControl?.maximize?.()
        break
      case 'alwaysOnTop':
        console.log('[Window] Always on Top (placeholder)')
        break

      // Help
      case 'viewHelp':
      case 'checkUpdates':
      case 'about':
        console.log('[Help]', action)
        break

      default:
        console.log('[Unhandled command]', action)
    }
  }

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
        onSelect={() => item.action && handleCommand(item.action)}
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
        {config.menubar.map((menuGroup) => (
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
          <div className="flex items-center pr-3 mr-3 border-r border-gray-200 dark:border-gray-700">
            <RibbonButton icon={Database} label="新建连接" />
            <RibbonButton icon={FolderPlus} label="新建" />
            <RibbonButton icon={RefreshCw} label="刷新" />
          </div>
          <div className="flex items-center pr-3 mr-3 border-r border-gray-200 dark:border-gray-700">
            <RibbonButton icon={Table2} label="表" />
            <RibbonButton icon={Users} label="用户" />
            <RibbonButton icon={Play} label="查询" />
          </div>
          <div className="flex items-center">
            <RibbonButton icon={FileUp} label="导入" />
            <RibbonButton icon={Settings} label="设置" />
          </div>
        </div>
        <div className="mr-2">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
