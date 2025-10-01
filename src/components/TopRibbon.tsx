import { Database, Table2, Users, Settings, Play, FolderPlus, FileUp, RefreshCw } from 'lucide-react'
import * as Menubar from '@radix-ui/react-menubar'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

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
  const handleCommand = (cmd: string) => {
    switch (cmd) {
      // 文件
      case '新建连接':
      case '新建':
      case '打开外部文件':
      case '打开最近使用过的':
      case '导入连接':
      case '导出连接':
        console.log('[菜单]', cmd)
        break
      case '退出':
        window.electronAPI?.windowControl?.close?.()
        break

      // 编辑
      case '撤销':
      case '重做':
      case '剪切':
      case '复制':
      case '粘贴':
      case '全选':
        console.log('[编辑]', cmd)
        break

      // 收藏夹/工具
      case '添加到收藏夹':
      case '管理收藏夹':
      case '结构同步':
      case '数据传输':
      case '备份':
      case '计划任务':
        console.log('[工具]', cmd)
        break

      // 窗口
      case '最小化':
        window.electronAPI?.windowControl?.minimize?.()
        break
      case '最大化':
        window.electronAPI?.windowControl?.maximize?.()
        break
      case '置顶':
        // 若主进程暴露了置顶切换，可改为 toggleAlwaysOnTop
        console.log('[窗口] 置顶 (占位)')
        break

      // 帮助
      case '查看帮助':
      case '检查更新':
      case '关于 Catyas':
        console.log('[帮助]', cmd)
        break

      default:
        console.log('[未处理命令]', cmd)
    }
  }
  const menu = {
    文件: ['新建连接', '新建', '打开外部文件', '打开最近使用过的', '关闭窗口', '导入连接', '导出连接', '管理云...', '退出'],
    编辑: ['撤销', '重做', '剪切', '复制', '粘贴', '全选'],
    收藏夹: ['添加到收藏夹', '管理收藏夹'],
    工具: ['结构同步', '数据传输', '备份', '计划任务'],
    窗口: ['最小化', '最大化', '置顶'],
    帮助: ['查看帮助', '检查更新', '关于 Catyas'],
  } as const

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 select-none app-no-drag">
      <Menubar.Root className="h-8 px-1 flex items-center text-[13px] text-gray-800 dark:text-gray-200 space-x-1">
        {Object.entries(menu).map(([label, items]) => (
          <Menubar.Menu key={label}>
            <Menubar.Trigger className="px-2.5 h-8 rounded data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
              {label}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content align="start" className="min-w-[220px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-40 rounded">
                {items.map((item) => (
                  <Menubar.Item
                    key={item}
                    onSelect={() => handleCommand(item)}
                    className="outline-none w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default"
                  >
                    {item}
                  </Menubar.Item>
                ))}
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
