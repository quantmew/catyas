import React from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Square, X } from 'lucide-react'

const Titlebar: React.FC = () => {
  const { t } = useTranslation()

  const handleMinimize = () => {
    window.electronAPI?.windowControl?.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.windowControl?.maximize()
  }

  const handleClose = () => {
    window.electronAPI?.windowControl?.close()
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-gray-200 dark:bg-gray-800 flex items-center justify-between select-none z-50 app-drag-region">
      {/* Left side - App title */}
      <div className="flex items-center h-full px-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('app.title')}
        </span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center h-full app-no-drag">
        <button
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          aria-label={t('window.minimize')}
        >
          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          aria-label={t('window.maximize')}
        >
          <Square className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
          aria-label={t('window.close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Titlebar