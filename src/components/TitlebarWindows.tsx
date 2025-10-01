import React from 'react'
import { useTranslation } from 'react-i18next'

const TitlebarWindows: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-white dark:bg-gray-900 flex items-center justify-between select-none z-50 app-drag-region border-b border-gray-200 dark:border-gray-800">
      {/* Left side - App title and icon */}
      <div className="flex items-center h-full px-3 gap-2 app-no-drag">
        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
          {t('app.title')}
        </span>
      </div>

      {/* Right side - Native window controls are provided by titleBarOverlay */}
      {/* No need to add custom buttons here */}
    </div>
  )
}

export default TitlebarWindows
