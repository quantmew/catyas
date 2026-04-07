import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ConnectionDialogHeaderProps {
  title: string
  onClose: () => void
}

interface ConnectionDiagramProps {
  leftLabel: string
  rightLabel: string
  LeftIcon: LucideIcon
  RightIcon: LucideIcon
}

interface ConnectionDialogTabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

interface ConnectionDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface ConnectionDialogFooterProps {
  onTest?: () => void
  onSave: () => void
  onCancel: () => void
  testing?: boolean
  testMessage?: string | null
  t: (key: string) => string
}

export function ConnectionDialogHeader({ title, onClose }: ConnectionDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
      <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ConnectionDiagram({ leftLabel, rightLabel, LeftIcon, RightIcon }: ConnectionDiagramProps) {
  return (
    <div className="px-4 py-4 flex items-center justify-center gap-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center">
        <LeftIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">{leftLabel}</span>
      </div>
      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 max-w-[120px]"></div>
      <div className="flex flex-col items-center">
        <RightIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">{rightLabel}</span>
      </div>
    </div>
  )
}

export function ConnectionDialogTabs({ tabs, activeTab, onTabChange }: ConnectionDialogTabsProps) {
  return (
    <div className="px-3 pt-3 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <div className="flex gap-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`px-3 py-1.5 text-[13px] border border-gray-300 dark:border-gray-600 rounded-t transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b-white dark:border-b-gray-800 -mb-px'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ConnectionDialogContent({ children, className }: ConnectionDialogContentProps) {
  return (
    <div className={`px-6 py-4 bg-white dark:bg-gray-800 ${className || 'min-h-[400px] max-h-[500px] overflow-y-auto'}`}>
      {children}
    </div>
  )
}

export function ConnectionDialogFooter({
  onTest,
  onSave,
  onCancel,
  testing = false,
  testMessage,
  t
}: ConnectionDialogFooterProps) {
  return (
    <div className="px-4 py-3 border-t border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
      <div className="text-xs w-4">
        {testMessage && (
          <span className={testMessage.includes('success') || testMessage.includes('成功') ? 'text-green-600' : 'text-red-600'}>
            {testMessage}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onTest && (
          <button
            onClick={onTest}
            disabled={testing}
            className="px-6 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            {testing ? t('connection.testing') : t('connection.testConnection')}
          </button>
        )}
        <button
          onClick={onSave}
          className="px-6 py-1.5 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
        >
          {t('connection.ok')}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {t('connection.cancel')}
        </button>
      </div>
    </div>
  )
}
