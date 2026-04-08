import { useEffect, useState } from 'react'
import { X, Table2, Play, Save, Wrench, Sparkles, FileCode, BarChart3 } from 'lucide-react'
import MonacoSqlEditor from './MonacoSqlEditor'
import { useTranslation } from 'react-i18next'

interface Tab {
  id: string
  title: string
  type: 'table' | 'query'
  content?: any
}

interface TabbedViewProps {
  selectedTable?: string | null
  connection?: any
  onClose?: () => void
}

export default function TabbedView({ selectedTable: _selectedTable, connection, onClose }: TabbedViewProps) {
  const { t } = useTranslation()
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'welcome', title: t('query.welcome'), type: 'query' }
  ])
  const [activeTab, setActiveTab] = useState('welcome')
  const [queryTexts, setQueryTexts] = useState<Record<string,string>>({})

  useEffect(()=>{
    const handler = () => addTab(t('query.untitledQuery'),'query')
    window.addEventListener('open-new-query-tab', handler as any)
    return () => window.removeEventListener('open-new-query-tab', handler as any)
  }, [tabs, t])

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
          onClick={() => addTab(t('query.newQuery'), 'query')}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          title={t('query.newQuery')}
        >
          +
        </button>
        {onClose && (
          <div className="flex-1" />
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 mr-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title={t('query.close')}
          >
            {t('query.close')}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`h-full ${activeTab === tab.id ? 'flex' : 'hidden'} flex-col`}
          >
            {tab.id === 'welcome' ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <h2 className="text-2xl font-semibold mb-4">{t('query.welcomeMessage')}</h2>
                  <p className="mb-2">{t('query.selectConnection')}</p>
                  <p>{t('query.createConnection')}</p>
                </div>
              </div>
            ) : tab.type === 'table' ? (
              <div className="flex-1 p-4 overflow-auto">
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-4">
                  <h3 className="text-sm font-semibold mb-2">{t('table.name')}: {tab.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('connection.name')}: {connection?.name || t('query.notConnected')}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {t('table.columnName')}
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {t('table.dataType')}
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {t('table.value')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400" colSpan={3}>
                          {t('table.loading')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                {/* 顶部工具栏 - 两行布局 */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                  {/* 第一行 - 工具按钮 */}
                  <div className="h-10 px-3 flex items-center gap-3 text-sm border-b border-gray-200 dark:border-gray-700">
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('query.save')}</span>
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{t('query.queryBuilder')}</span>
                    </button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('query.beautifySQL')}</span>
                    </button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{t('query.snippets')}</span>
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{t('query.createChart')}</span>
                    </button>
                  </div>

                  {/* 第二行 - 连接选择和执行按钮 */}
                  <div className="h-10 px-3 flex items-center gap-3 text-sm">
                    <select className="h-7 min-w-[140px] border rounded px-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                      <option>{connection?.name || t('query.notConnected')}</option>
                    </select>
                    <select className="h-7 min-w-[120px] border rounded px-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                      <option>macro</option>
                    </select>
                    <div className="mx-2 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t('query.run')}</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" disabled>{t('query.stop')}</button>
                    <button className="px-2 py-1 border rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">{t('query.explain')}</button>
                  </div>
                </div>

                {/* SQL 编辑区域 - 占据2/3空间 */}
                <div className="flex-[2] min-h-0 overflow-hidden">
                  <MonacoSqlEditor
                    value={queryTexts[tab.id]||''}
                    onChange={(v)=>setQueryTexts(prev=>({...prev, [tab.id]: v}))}
                  />
                </div>

                {/* 查询结果区域 - 占据1/3空间 */}
                <div className="flex-1 min-h-0 border-t border-gray-200 dark:border-gray-700 p-4 overflow-auto">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('query.queryResult')}</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('query.noResults')}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
