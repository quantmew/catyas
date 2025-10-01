import React from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Square, X } from 'lucide-react'

const TitlebarWindows: React.FC = () => {
  const { t } = useTranslation()

  const handleMinimize = () => {
    if (window.electronAPI?.windowControl?.minimize) {
      window.electronAPI.windowControl.minimize()
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI?.windowControl?.maximize) {
      window.electronAPI.windowControl.maximize()
    }
  }

  const handleClose = () => {
    if (window.electronAPI?.windowControl?.close) {
      window.electronAPI.windowControl.close()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-white dark:bg-gray-900 flex items-center justify-between select-none z-50 app-drag-region border-b border-gray-200 dark:border-gray-800">
      {/* Left side - App title and icon */}
      <div className="flex items-center h-full px-3 gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
          {t('app.title')}
        </span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center h-full app-no-drag">
        <button
          onClick={handleMinimize}
          className="h-full w-12 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label={t('window.minimize')}
        >
          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full w-12 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label={t('window.maximize')}
        >
          <Square className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleClose}
          className="h-full w-12 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
          aria-label={t('window.close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default TitlebarWindows