import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from './locales/en.json'
import zhCNTranslation from './locales/zh-CN.json'
import jaTranslation from './locales/ja.json'
import koTranslation from './locales/ko.json'
import frTranslation from './locales/fr.json'
import deTranslation from './locales/de.json'
import esTranslation from './locales/es.json'
import ptBRTranslation from './locales/pt-BR.json'
import ruTranslation from './locales/ru.json'

const resources = {
  en: {
    translation: enTranslation
  },
  'zh-CN': {
    translation: zhCNTranslation
  },
  ja: {
    translation: jaTranslation
  },
  ko: {
    translation: koTranslation
  },
  fr: {
    translation: frTranslation
  },
  de: {
    translation: deTranslation
  },
  es: {
    translation: esTranslation
  },
  'pt-BR': {
    translation: ptBRTranslation
  },
  ru: {
    translation: ruTranslation
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n