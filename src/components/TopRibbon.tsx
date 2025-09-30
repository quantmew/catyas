import { Database, Table2, Users, Settings, Play, FolderPlus, FileUp, RefreshCw } from 'lucide-react'

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
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-10 px-3 flex items-center text-sm text-gray-600 dark:text-gray-300">
        文件 编辑 收藏夹 工具 窗口 帮助
      </div>
      <div className="h-16 px-3 flex items-center overflow-x-auto">
        <div className="flex items-center pr-4 mr-4 border-r border-gray-200 dark:border-gray-700">
          <RibbonButton icon={Database} label="连接" />
          <RibbonButton icon={FolderPlus} label="新建" />
          <RibbonButton icon={RefreshCw} label="刷新" />
        </div>
        <div className="flex items-center pr-4 mr-4 border-r border-gray-200 dark:border-gray-700">
          <RibbonButton icon={Table2} label="表" />
          <RibbonButton icon={Users} label="用户" />
          <RibbonButton icon={Play} label="查询" />
        </div>
        <div className="flex items-center">
          <RibbonButton icon={FileUp} label="导入" />
          <RibbonButton icon={Settings} label="设置" />
        </div>
      </div>
    </div>
  )
}

