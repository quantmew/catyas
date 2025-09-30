import { Info } from 'lucide-react'

interface RightInfoProps {
  tableName?: string | null
}

export default function RightInfo({ tableName }: RightInfoProps) {
  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
        <Info className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">属性</span>
      </div>
      <div className="p-4 text-xs text-gray-600 dark:text-gray-300 space-y-2 overflow-auto">
        <div>
          <div className="text-gray-400">对象</div>
          <div className="font-medium text-gray-800 dark:text-gray-100">{tableName || '未选择'}</div>
        </div>
        <div>
          <div className="text-gray-400">引擎</div>
          <div>InnoDB</div>
        </div>
        <div>
          <div className="text-gray-400">行格式</div>
          <div>Dynamic</div>
        </div>
        <div>
          <div className="text-gray-400">修改日期</div>
          <div>2025-09-28 17:31:00</div>
        </div>
      </div>
    </div>
  )
}

