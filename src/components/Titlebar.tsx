import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const Titlebar: React.FC = () => {
  const { t } = useTranslation()
  const [platform, setPlatform] = useState<NodeJS.Platform | null>(null)

  useEffect(() => {
    if (window.electronAPI?.platform) {
      setPlatform(window.electronAPI.platform)
    }
  }, [])

  // On macOS, show traffic lights with custom title bar
  if (platform === 'darwin') {
    return (
      <div className="fixed top-0 left-0 right-0 h-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center select-none z-50 app-drag-region border-b border-gray-200 dark:border-gray-700">
        <div className="absolute left-20 flex items-center h-full px-3 gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {t('app.title')}
          </span>
        </div>
      </div>
    )
  }

  // On Windows/Linux, titleBarOverlay provides native controls
  // We just need a simple draggable title bar
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-white dark:bg-gray-900 flex items-center select-none z-50 app-drag-region border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center h-full px-3 gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
          {t('app.title')}
        </span>
      </div>
    </div>
  )
}

export default Titlebar