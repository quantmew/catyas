import { useMemo } from 'react'

export type ObjectTree = {
  tables: Record<string, boolean>
  views: Record<string, boolean>
  functions: Record<string, boolean>
  events: Record<string, boolean>
}

interface Props {
  value: ObjectTree
  onChange: (v: ObjectTree) => void
}

export default function Step2SelectObjects({ value, onChange }: Props) {
  const counts = useMemo(() => ({
    tables: Object.values(value.tables).filter(Boolean).length,
    views: Object.values(value.views).filter(Boolean).length,
    functions: Object.values(value.functions).filter(Boolean).length,
    events: Object.values(value.events).filter(Boolean).length,
  }), [value])

  const setAll = (group: keyof ObjectTree, checked: boolean) => {
    const next = { ...value, [group]: Object.fromEntries(Object.keys(value[group]).map(k => [k, checked])) }
    onChange(next)
  }

  const toggle = (group: keyof ObjectTree, key: string, checked: boolean) => {
    onChange({ ...value, [group]: { ...value[group], [key]: checked } })
  }

  const renderGroup = (title: string, group: keyof ObjectTree, icon?: string) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
        <span>{icon}</span>
        <span>{title} ({counts[group]}/{Object.keys(value[group]).length})</span>
      </div>
      <div className="mt-2 ml-6 space-y-1">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={counts[group]===Object.keys(value[group]).length} onChange={e=>setAll(group, e.target.checked)} />运行期间的全部{title}</label>
        <div className="text-xs text-gray-500">自定义</div>
        <div className="max-h-48 overflow-auto pr-1">
          {Object.keys(value[group]).map(k => (
            <label key={k} className="flex items-center gap-2 py-0.5 text-sm">
              <input type="checkbox" checked={value[group][k]} onChange={e=>toggle(group, k, e.target.checked)} />
              <span className="truncate">{k}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex gap-6 h-full">
      {/* Left tree */}
      <div className="w-[360px] border border-gray-200 dark:border-gray-700 rounded p-3 overflow-auto">
        <div className="text-blue-600 font-semibold mb-3">数据库对象</div>
        {renderGroup('表','tables','📄')}
        {renderGroup('视图','views','👓')}
        {renderGroup('函数','functions','ƒ')}
        {renderGroup('事件','events','✓')}
      </div>

      {/* Right side help */}
      <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 relative">
        从“数据库对象”选择要传输的项目。若要自定义单个表的传输模式，请高亮显示“数据库对象”上的表。
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 pt-6">
          <button className="px-3 py-1.5 text-sm border rounded">保存配置文件</button>
          <button className="px-3 py-1.5 text-sm border rounded">加载配置文件</button>
          <button className="px-3 py-1.5 text-sm border rounded">选项</button>
        </div>
      </div>
    </div>
  )
}

