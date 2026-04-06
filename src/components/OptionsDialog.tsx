import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { X, Globe } from 'lucide-react'

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

  // Behavior states
  const [confirmOnClose, setConfirmOnClose] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(false)
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const [sendUsageData, setSendUsageData] = useState(false)

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
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
          <div className="flex min-h-[420px]">
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

              {/* Placeholder for other categories */}
              {selectedCategory !== 'environment' && (
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
