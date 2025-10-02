import { useEffect, useState } from 'react'
import { X, Table2, Play } from 'lucide-react'
import SqlEditor from './SqlEditor'

interface Tab {
  id: string
  title: string
  type: 'table' | 'query'
  content?: any
}

interface TabbedViewProps {
  selectedTable?: string | null
  connection?: any
}

export default function TabbedView({ selectedTable, connection }: TabbedViewProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'welcome', title: '欢迎', type: 'query' }
  ])
  const [activeTab, setActiveTab] = useState('welcome')
  const [queryTexts, setQueryTexts] = useState<Record<string,string>>({})

  useEffect(()=>{
    const handler = () => addTab('无标题 - 查询','query')
    window.addEventListener('open-new-query-tab', handler as any)
    return () => window.removeEventListener('open-new-query-tab', handler as any)
  }, [tabs])

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
  }

  const addTab = (title: string, type: 'table' | 'query') => {
    const newTab: Tab = {
      id: `${type}-${Date.now()}`,
      title,
      type
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`
              group flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.type === 'table' ? (
              <Table2 className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm whitespace-nowrap">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addTab('新查询', 'query')}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="新建查询"
        >
          +
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`h-full ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            {tab.id === 'welcome' ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <h2 className="text-2xl font-semibold mb-4">欢迎使用 Catyas</h2>
                  <p className="mb-2">请从左侧选择一个数据库连接</p>
                  <p>或者创建一个新的连接</p>
                </div>
              </div>
            ) : tab.type === 'table' ? (
              <div className="h-full p-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-4">
                  <h3 className="text-sm font-semibold mb-2">表: {tab.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    连接: {connection?.name || '未连接'}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          列名
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          数据类型
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          值
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400" colSpan={3}>
                          加载中...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-0">
                  {/* 顶部工具栏 */}
                  <div className="h-10 px-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm">
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">保存</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">查询创建工具</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">美化 SQL</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">代码段</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">创建图表</button>
                    <div className="mx-2 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    {/* 连接与数据库选择 */}
                    <select className="h-7 min-w-[140px] border rounded px-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                      <option>{connection?.name || '未连接'}</option>
                    </select>
                    <select className="h-7 min-w-[120px] border rounded px-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                      <option>macro</option>
                    </select>
                    <div className="mx-2 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 text-blue-600">运行</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800" disabled>停止</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800">解释</button>
                  </div>

                  {/* SQL 编辑区域 */}
                  <div className="p-2">
                    <SqlEditor value={queryTexts[tab.id]||''} onChange={(v)=>setQueryTexts(prev=>({...prev, [tab.id]: v}))} />
                  </div>
                </div>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">查询结果</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    暂无结果
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
