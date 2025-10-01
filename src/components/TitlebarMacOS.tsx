import React from 'react'
import { useTranslation } from 'react-i18next'

const TitlebarMacOS: React.FC = () => {
  const { t } = useTranslation()

  const handleClose = () => {
    if (window.electronAPI?.windowControl?.close) {
      window.electronAPI.windowControl.close()
    }
  }

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

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center select-none z-50 app-drag-region border-b border-gray-200 dark:border-gray-700">
      {/* Left side - macOS traffic lights */}
      <div className="absolute left-0 flex items-center h-full px-3 gap-2 app-no-drag">
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
          aria-label={t('window.close')}
        >
          <span className="text-[10px] text-red-900 opacity-0 group-hover:opacity-100">×</span>
        </button>
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center group"
          aria-label={t('window.minimize')}
        >
          <span className="text-[10px] text-yellow-900 opacity-0 group-hover:opacity-100">−</span>
        </button>
        <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center group"
          aria-label={t('window.maximize')}
        >
          <span className="text-[10px] text-green-900 opacity-0 group-hover:opacity-100">⤢</span>
        </button>
      </div>

      {/* Center - App title */}
      <div className="flex items-center h-full">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('app.title')}
        </span>
      </div>
    </div>
  )
}

export default TitlebarMacOS