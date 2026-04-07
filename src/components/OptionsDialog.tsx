import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { X, Globe, FolderOpen } from 'lucide-react'

type Category = 'environment' | 'tabs' | 'autoComplete' | 'editor' | 'records' | 'autoRecovery' | 'fileLocation' | 'connectivity' | 'advanced'

const categories: Category[] = [
  'environment', 'tabs', 'autoComplete', 'editor', 'records',
  'autoRecovery', 'fileLocation', 'connectivity', 'advanced'
]

interface OptionsDialogProps {
  open: boolean
  onClose: () => void
}

export default function OptionsDialog({ open, onClose }: OptionsDialogProps) {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<Category>('environment')
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  const [language, setLanguage] = useState(i18n.language)

  // Tabs settings
  const [openNewTabIn, setOpenNewTabIn] = useState<'main' | 'last' | 'lastExceptMain' | 'new'>('main')
  const [startupView, setStartupView] = useState<'onlyObject' | 'continue' | 'specific'>('onlyObject')
  const [settingsPath, setSettingsPath] = useState('')

  // Behavior states
  const [confirmOnClose, setConfirmOnClose] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(false)
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const [sendUsageData, setSendUsageData] = useState(false)

  // Auto Completion states
  const [useAutoComplete, setUseAutoComplete] = useState(true)
  const [autoUpdateInfo, setAutoUpdateInfo] = useState(true)
  const [autoSelectFirst, setAutoSelectFirst] = useState(true)

  // Editor states
  const [editorFont, setEditorFont] = useState('Consolas')
  const [editorFontSize, setEditorFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(4)
  const [wordWrap, setWordWrap] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [highlightCurrentLine, setHighlightCurrentLine] = useState(true)
  const [highlightMatchingBrackets, setHighlightMatchingBrackets] = useState(true)
  const [showMinimap, setShowMinimap] = useState(false)
  const [cursorStyle, setCursorStyle] = useState<'line' | 'block' | 'underline'>('line')
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>('upper')

  // Records states
  const [limitRecords, setLimitRecords] = useState(true)
  const [recordsPerPage, setRecordsPerPage] = useState(1000)
  const [autoStartTransaction, setAutoStartTransaction] = useState(false)
  const [gridFont, setGridFont] = useState('Segoe UI')
  const [gridFontSize, setGridFontSize] = useState(9)
  const [rowStripes, setRowStripes] = useState(3)
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD')
  const [timeFormat, setTimeFormat] = useState('HH:mm:ss')
  const [datetimeFormat, setDatetimeFormat] = useState('YYYY-MM-DD HH:mm:ss')
  const [showThousandsSeparator, setShowThousandsSeparator] = useState(false)
  const [showNullAsText, setShowNullAsText] = useState(false)

  // Auto Recovery states
  const [autoRecoverQuery, setAutoRecoverQuery] = useState(true)
  const [autoRecoverModel, setAutoRecoverModel] = useState(true)
  const [autoRecoverChart, setAutoRecoverChart] = useState(true)
  const [querySaveInterval, setQuerySaveInterval] = useState(30)
  const [modelSaveInterval, setModelSaveInterval] = useState(180)
  const [chartSaveInterval, setChartSaveInterval] = useState(180)

  // File Location states
  const [logLocation, setLogLocation] = useState('')
  const [mysqlConfigLocation, setMysqlConfigLocation] = useState('')
  const [postgresqlConfigLocation, setPostgresqlConfigLocation] = useState('')
  const [oracleConfigLocation, setOracleConfigLocation] = useState('')
  const [sqliteConfigLocation, setSqliteConfigLocation] = useState('')
  const [sqlserverConfigLocation, setSqlserverConfigLocation] = useState('')
  const [mariadbConfigLocation, setMariadbConfigLocation] = useState('')
  const [mongodbConfigLocation, setMongodbConfigLocation] = useState('')
  const [redisConfigLocation, setRedisConfigLocation] = useState('')
  const [defaultConfigLocation, setDefaultConfigLocation] = useState('')
  const [exportWizardLocation, setExportWizardLocation] = useState('')

  // Connectivity states
  const [verifyServerCert, setVerifyServerCert] = useState(true)
  const [useProxy, setUseProxy] = useState(true)
  const [proxyType, setProxyType] = useState<'HTTP' | 'SOCKS4' | 'SOCKS5'>('HTTP')
  const [proxyHost, setProxyHost] = useState('127.0.0.1')
  const [proxyPort, setProxyPort] = useState('10806')
  const [proxyUsername, setProxyUsername] = useState('')
  const [proxyPassword, setProxyPassword] = useState('')

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('catyas-theme', newTheme)
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const handleBrowsePath = async (setter?: (path: string) => void) => {
    try {
      const result = await window.electronAPI?.openFileDialog({
        title: 'Select Folder',
        defaultPath: '',
        filters: [
          { name: 'All Files', extensions: ['*'] },
        ],
      })
      if (result?.filePath) {
        if (setter) {
          setter(result.filePath)
        } else {
          setSettingsPath(result.filePath)
        }
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err)
    }
  }

  const handleResetDefaults = () => {
    handleThemeChange('light')
    handleLanguageChange('en')
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'ru', name: 'Русский' }
  ]

  const behaviorCheckboxes = [
    { checked: confirmOnClose, onChange: setConfirmOnClose, key: 'options.general.confirmOnClose' },
    { checked: autoStart, onChange: setAutoStart, key: 'options.general.autoStart' },
    { checked: minimizeToTray, onChange: setMinimizeToTray, key: 'options.general.minimizeToTray' },
    { checked: showHiddenFiles, onChange: setShowHiddenFiles, key: 'options.general.showHiddenFiles' },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[540px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {t('options.title')}
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-4 h-4 text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Body: Left nav + Right content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left navigation */}
            <div className="w-40 border-r border-gray-200 dark:border-gray-700 py-1 flex flex-col bg-gray-50 dark:bg-gray-800/50">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-[13px] text-left transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {t(`options.categories.${cat}`)}
                </button>
              ))}
            </div>

            {/* Right content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {selectedCategory === 'environment' && (
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.general.theme')}
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="w-[120px] h-[80px] rounded bg-white border border-gray-200 mb-2 overflow-hidden shadow-sm">
                          <div className="h-5 bg-gray-100 border-b border-gray-200 flex items-center px-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              <div className="w-2 h-2 rounded-full bg-yellow-400" />
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                            </div>
                          </div>
                          <div className="flex flex-1">
                            <div className="w-8 bg-gray-50 border-r border-gray-200 py-1 space-y-1 px-1">
                              <div className="h-1 bg-gray-300 rounded w-full" />
                              <div className="h-1 bg-gray-300 rounded w-3/4" />
                            </div>
                            <div className="flex-1 p-1.5 space-y-1">
                              <div className="h-1.5 bg-gray-200 rounded w-3/4" />
                              <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                              <div className="h-1.5 bg-gray-100 rounded w-2/3" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t('options.general.themeLight')}</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="w-[120px] h-[80px] rounded bg-gray-800 border border-gray-600 mb-2 overflow-hidden shadow-sm">
                          <div className="h-5 bg-gray-700 border-b border-gray-600 flex items-center px-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              <div className="w-2 h-2 rounded-full bg-yellow-400" />
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                            </div>
                          </div>
                          <div className="flex flex-1">
                            <div className="w-8 bg-gray-750 border-r border-gray-600 py-1 space-y-1 px-1">
                              <div className="h-1 bg-gray-500 rounded w-full" />
                              <div className="h-1 bg-gray-500 rounded w-3/4" />
                            </div>
                            <div className="flex-1 p-1.5 space-y-1">
                              <div className="h-1.5 bg-gray-600 rounded w-3/4" />
                              <div className="h-1.5 bg-gray-650 rounded w-1/2" />
                              <div className="h-1.5 bg-gray-650 rounded w-2/3" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t('options.general.themeDark')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4" />
                      {t('options.general.language')}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Behavior */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.general.behavior')}
                    </label>
                    <div className="space-y-2.5">
                      {behaviorCheckboxes.map(item => (
                        <label key={item.key} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => item.onChange(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          {t(item.key)}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Usage Data */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('options.general.behavior')}
                    </label>
                    <label className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendUsageData}
                        onChange={(e) => setSendUsageData(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span>{t('options.general.sendUsageData')}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tabs category */}
              {selectedCategory === 'tabs' && (
                <div className="space-y-6">
                  {/* Open new tab in */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.tabs.openNewTabIn')}
                    </label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="openNewTabIn"
                          checked={openNewTabIn === 'main'}
                          onChange={() => setOpenNewTabIn('main')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.mainWindow')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="openNewTabIn"
                          checked={openNewTabIn === 'last'}
                          onChange={() => setOpenNewTabIn('last')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.lastWindow')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="openNewTabIn"
                          checked={openNewTabIn === 'lastExceptMain'}
                          onChange={() => setOpenNewTabIn('lastExceptMain')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.lastExceptMain')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="openNewTabIn"
                          checked={openNewTabIn === 'new'}
                          onChange={() => setOpenNewTabIn('new')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.newWindow')}
                      </label>
                    </div>
                  </div>

                  {/* Startup view */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.tabs.startupView')}
                    </label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="startupView"
                          checked={startupView === 'onlyObject'}
                          onChange={() => setStartupView('onlyObject')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.onlyObjectTab')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="startupView"
                          checked={startupView === 'continue'}
                          onChange={() => setStartupView('continue')}
                          className="accent-blue-500"
                        />
                        {t('options.tabs.continueFromLast')}
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="startupView"
                          checked={startupView === 'specific'}
                          onChange={() => setStartupView('specific')}
                          className="accent-blue-500 mt-0.5"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('options.tabs.specificTabs')}</span>
                        <button
                          onClick={() => handleBrowsePath(setSettingsPath)}
                          disabled={startupView !== 'specific'}
                          className="ml-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('options.tabs.setTabs')}...
                        </button>
                      </div>
                      {settingsPath && startupView === 'specific' && (
                        <div className="ml-6 mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <FolderOpen className="w-3 h-3" />
                          <span className="truncate max-w-md">{settingsPath}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {t('options.tabs.restartNote')}
                    </p>
                  </div>
                </div>
              )}

              {/* Auto Completion category */}
              {selectedCategory === 'autoComplete' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.categories.autoComplete')}
                    </label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useAutoComplete}
                          onChange={(e) => setUseAutoComplete(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.autoComplete.useAutoComplete')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoUpdateInfo}
                          onChange={(e) => setAutoUpdateInfo(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.autoComplete.autoUpdateInfo')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSelectFirst}
                          onChange={(e) => setAutoSelectFirst(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.autoComplete.autoSelectFirst')}
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setUseAutoComplete(true); setAutoUpdateInfo(true); setAutoSelectFirst(true) }}
                      className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      {t('options.autoComplete.clear')}
                    </button>
                  </div>
                </div>
              )}

              {/* Editor category */}
              {selectedCategory === 'editor' && (
                <div className="space-y-5">
                  {/* Code Completion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.editor.codeCompletion')}
                    </label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useAutoComplete}
                          onChange={(e) => setUseAutoComplete(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.useAutoCompletion')}
                      </label>
                      <div className="flex items-center gap-3 ml-6">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('options.editor.keywordCase')}:</span>
                        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="keywordCase"
                            checked={keywordCase === 'upper'}
                            onChange={() => setKeywordCase('upper')}
                            className="accent-blue-500"
                          />
                          {t('options.editor.keywordUppercase')}
                        </label>
                        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="keywordCase"
                            checked={keywordCase === 'lower'}
                            onChange={() => setKeywordCase('lower')}
                            className="accent-blue-500"
                          />
                          {t('options.editor.keywordLowercase')}
                        </label>
                      </div>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoUpdateInfo}
                          onChange={(e) => setAutoUpdateInfo(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.autoUpdate')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSelectFirst}
                          onChange={(e) => setAutoSelectFirst(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.autoSelectFirst')}
                      </label>
                    </div>
                  </div>

                  {/* Editor Font & Tab Size */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.editor.editorFont')}</label>
                        <select
                          value={editorFont}
                          onChange={(e) => setEditorFont(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                          {['Consolas', 'Courier New', 'Monaco', 'Source Code Pro', 'Fira Code', 'JetBrains Mono'].map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.editor.fontSize')}</label>
                        <input
                          type="number"
                          value={editorFontSize}
                          onChange={(e) => setEditorFontSize(Number(e.target.value))}
                          min={8}
                          max={32}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.editor.tabSize')}</label>
                        <input
                          type="number"
                          value={tabSize}
                          onChange={(e) => setTabSize(Number(e.target.value))}
                          min={2}
                          max={8}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.editor.wordWrap')}</label>
                        <select
                          value={wordWrap ? 'on' : 'off'}
                          onChange={(e) => setWordWrap(e.target.value === 'on')}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                          <option value="off">{t('options.editor.wordWrapOff')}</option>
                          <option value="on">{t('options.editor.wordWrapOn')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Display options */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showLineNumbers}
                          onChange={(e) => setShowLineNumbers(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.showLineNumbers')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={highlightCurrentLine}
                          onChange={(e) => setHighlightCurrentLine(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.highlightCurrentLine')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={highlightMatchingBrackets}
                          onChange={(e) => setHighlightMatchingBrackets(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.highlightMatchingBrackets')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMinimap}
                          onChange={(e) => setShowMinimap(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.editor.minimap')}
                      </label>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.editor.cursorStyle')}</label>
                      <select
                        value={cursorStyle}
                        onChange={(e) => setCursorStyle(e.target.value as 'line' | 'block' | 'underline')}
                        className="w-full max-w-xs px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                      >
                        <option value="line">{t('options.editor.cursorLine')}</option>
                        <option value="block">{t('options.editor.cursorBlock')}</option>
                        <option value="underline">{t('options.editor.cursorUnderline')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Records category */}
              {selectedCategory === 'records' && (
                <div className="space-y-5">
                  {/* Records */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.records.records')}
                    </label>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={limitRecords}
                            onChange={(e) => setLimitRecords(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          {t('options.records.limitRecords')}
                        </label>
                        <input
                          type="number"
                          value={recordsPerPage}
                          onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                          disabled={!limitRecords}
                          className="w-24 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('options.records.recordsPerPage')}</span>
                      </div>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoStartTransaction}
                          onChange={(e) => setAutoStartTransaction(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.records.autoStartTransaction')}
                      </label>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.records.grid')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.records.gridFont')}</label>
                        <select
                          value={gridFont}
                          onChange={(e) => setGridFont(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                          {['Segoe UI', 'Arial', 'Tahoma', 'Verdana', 'Microsoft YaHei', 'Consolas'].map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.records.fontSize')}</label>
                        <input
                          type="number"
                          value={gridFontSize}
                          onChange={(e) => setGridFontSize(Number(e.target.value))}
                          min={8}
                          max={24}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('options.records.rowStripes')}</label>
                      <select
                        value={rowStripes}
                        onChange={(e) => setRowStripes(Number(e.target.value))}
                        className="w-full max-w-xs px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                      >
                        <option value={0}>{t('options.records.none')}</option>
                        <option value={2}>{t('options.records.everyRow', { n: 2 })}</option>
                        <option value={3}>{t('options.records.everyRow', { n: 3 })}</option>
                        <option value={4}>{t('options.records.everyRow', { n: 4 })}</option>
                      </select>
                    </div>
                  </div>

                  {/* Display Format */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.records.displayFormat')}
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.records.dateFormat')}</label>
                        <input
                          type="text"
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.records.timeFormat')}</label>
                        <input
                          type="text"
                          value={timeFormat}
                          onChange={(e) => setTimeFormat(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.records.datetimeFormat')}</label>
                        <input
                          type="text"
                          value={datetimeFormat}
                          onChange={(e) => setDatetimeFormat(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showThousandsSeparator}
                          onChange={(e) => setShowThousandsSeparator(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.records.showThousandsSeparator')}
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showNullAsText}
                          onChange={(e) => setShowNullAsText(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.records.showNullAsText')}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto Recovery category */}
              {selectedCategory === 'autoRecovery' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.autoRecovery.title')}
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={autoRecoverQuery}
                          onChange={(e) => setAutoRecoverQuery(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.autoRecovery.query')}</label>
                          {autoRecoverQuery && (
                            <div className="flex items-center gap-2 mt-2 ml-6">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{t('options.autoRecovery.autoSaveInterval')}:</span>
                              <input
                                type="number"
                                value={querySaveInterval}
                                onChange={(e) => setQuerySaveInterval(Number(e.target.value))}
                                className="w-24 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={autoRecoverModel}
                          onChange={(e) => setAutoRecoverModel(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.autoRecovery.model')}</label>
                          {autoRecoverModel && (
                            <div className="flex items-center gap-2 mt-2 ml-6">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{t('options.autoRecovery.autoSaveInterval')}:</span>
                              <input
                                type="number"
                                value={modelSaveInterval}
                                onChange={(e) => setModelSaveInterval(Number(e.target.value))}
                                className="w-24 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={autoRecoverChart}
                          onChange={(e) => setAutoRecoverChart(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.autoRecovery.chart')}</label>
                          {autoRecoverChart && (
                            <div className="flex items-center gap-2 mt-2 ml-6">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{t('options.autoRecovery.autoSaveInterval')}:</span>
                              <input
                                type="number"
                                value={chartSaveInterval}
                                onChange={(e) => setChartSaveInterval(Number(e.target.value))}
                                className="w-24 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Location category */}
              {selectedCategory === 'fileLocation' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0">{t('options.fileLocation.logLocation')}</label>
                    <input
                      type="text"
                      value={logLocation}
                      onChange={(e) => setLogLocation(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                    />
                    <button
                      onClick={() => handleBrowsePath(setLogLocation)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      ...
                    </button>
                  </div>
                  {[
                    { label: t('options.fileLocation.mysql'), value: mysqlConfigLocation, setter: setMysqlConfigLocation },
                    { label: t('options.fileLocation.postgresql'), value: postgresqlConfigLocation, setter: setPostgresqlConfigLocation },
                    { label: t('options.fileLocation.oracle'), value: oracleConfigLocation, setter: setOracleConfigLocation },
                    { label: t('options.fileLocation.sqlite'), value: sqliteConfigLocation, setter: setSqliteConfigLocation },
                    { label: t('options.fileLocation.sqlserver'), value: sqlserverConfigLocation, setter: setSqlserverConfigLocation },
                    { label: t('options.fileLocation.mariadb'), value: mariadbConfigLocation, setter: setMariadbConfigLocation },
                    { label: t('options.fileLocation.mongodb'), value: mongodbConfigLocation, setter: setMongodbConfigLocation },
                    { label: t('options.fileLocation.redis'), value: redisConfigLocation, setter: setRedisConfigLocation },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0">{t('options.fileLocation.configLocation')} ({item.label})</label>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                      />
                      <button
                        onClick={() => handleBrowsePath(item.setter)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                      >
                        ...
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0">{t('options.fileLocation.configLocation')}</label>
                    <input
                      type="text"
                      value={defaultConfigLocation}
                      onChange={(e) => setDefaultConfigLocation(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                    />
                    <button
                      onClick={() => handleBrowsePath(setDefaultConfigLocation)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      ...
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0">{t('options.fileLocation.exportWizard')}</label>
                    <input
                      type="text"
                      value={exportWizardLocation}
                      onChange={(e) => setExportWizardLocation(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                    />
                    <button
                      onClick={() => handleBrowsePath(setExportWizardLocation)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      ...
                    </button>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {t('options.fileLocation.restartNote')}
                    </p>
                  </div>
                </div>
              )}

              {/* Connectivity category */}
              {selectedCategory === 'connectivity' && (
                <div className="space-y-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('options.connectivity.notice')}
                  </p>

                  {/* Regular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.connectivity.regular')}
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifyServerCert}
                        onChange={(e) => setVerifyServerCert(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      {t('options.connectivity.verifyServerCert')}
                    </label>
                  </div>

                  {/* Proxy Server */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.connectivity.proxyServer')}
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useProxy}
                          onChange={(e) => setUseProxy(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        {t('options.connectivity.useProxy')}
                      </label>
                      <div className={`grid grid-cols-[140px_1fr] gap-3 ${!useProxy ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.connectivity.proxyType')}</label>
                        <select
                          value={proxyType}
                          onChange={(e) => setProxyType(e.target.value as 'HTTP' | 'SOCKS4' | 'SOCKS5')}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                          <option value="HTTP">HTTP</option>
                          <option value="SOCKS4">SOCKS4</option>
                          <option value="SOCKS5">SOCKS5</option>
                        </select>
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.connectivity.host')}</label>
                        <input
                          type="text"
                          value={proxyHost}
                          onChange={(e) => setProxyHost(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.connectivity.port')}</label>
                        <input
                          type="text"
                          value={proxyPort}
                          onChange={(e) => setProxyPort(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.connectivity.username')}</label>
                        <input
                          type="text"
                          value={proxyUsername}
                          onChange={(e) => setProxyUsername(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                        <label className="text-sm text-gray-600 dark:text-gray-300">{t('options.connectivity.password')}</label>
                        <input
                          type="password"
                          value={proxyPassword}
                          onChange={(e) => setProxyPassword(e.target.value)}
                          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Connection Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('options.connectivity.connectionDiagnosis')}
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => console.log('Test connectivity')}
                        className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors border border-gray-300 dark:border-gray-600"
                      >
                        {t('options.connectivity.testConnection')}
                      </button>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">✓</span>
                          {t('options.connectivity.baidu')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">✓</span>
                          {t('options.connectivity.navicatWebsite')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">✓</span>
                          {t('options.connectivity.navicatWebService')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for advanced category */}
              {selectedCategory !== 'environment' && selectedCategory !== 'tabs' && selectedCategory !== 'autoComplete' && selectedCategory !== 'editor' && selectedCategory !== 'records' && selectedCategory !== 'autoRecovery' && selectedCategory !== 'fileLocation' && selectedCategory !== 'connectivity' && (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <p>{t('options.comingSoon')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              {t('options.general.restartNote')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
              >
                {t('options.default')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                {t('options.ok')}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
              >
                {t('options.cancel')}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
