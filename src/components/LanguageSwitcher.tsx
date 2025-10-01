import React from 'react'
import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '简体中文' }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Change language"
        >
          <Languages className="w-4 h-4" />
          <span>{currentLanguage.name}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[150px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
          sideOffset={5}
        >
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              className={`
                px-3 py-2 text-sm rounded cursor-pointer outline-none
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${i18n.language === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''}
              `}
              onSelect={() => changeLanguage(lang.code)}
            >
              {lang.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default LanguageSwitcher