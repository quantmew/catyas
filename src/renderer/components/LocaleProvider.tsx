import React from 'react'
import { ConfigProvider } from 'antd'
import { useTranslation } from 'react-i18next'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import jaJP from 'antd/locale/ja_JP'

const localeMap = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}

interface LocaleProviderProps {
  children: React.ReactNode
}

const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  const currentLocale = localeMap[i18n.language as keyof typeof localeMap] || zhCN

  return (
    <ConfigProvider locale={currentLocale}>
      {children}
    </ConfigProvider>
  )
}

export default LocaleProvider