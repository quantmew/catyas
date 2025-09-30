import { useTranslation } from 'react-i18next'

export const useI18n = () => {
  const { t, i18n } = useTranslation()

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (language: string) => i18n.changeLanguage(language),

    // 常用翻译快捷方式
    common: {
      ok: t('common.ok'),
      cancel: t('common.cancel'),
      delete: t('common.delete'),
      edit: t('common.edit'),
      add: t('common.add'),
      save: t('common.save'),
      refresh: t('common.refresh'),
      execute: t('common.execute'),
      clear: t('common.clear'),
      connect: t('common.connect'),
      disconnect: t('common.disconnect'),
      export: t('common.export'),
      import: t('common.import'),
      loading: t('common.loading'),
      success: t('common.success'),
      error: t('common.error'),
      warning: t('common.warning'),
      info: t('common.info')
    },

    // 连接相关翻译
    connection: {
      title: t('connection.title'),
      newConnection: t('connection.newConnection'),
      connectionName: t('connection.connectionName'),
      databaseType: t('connection.databaseType'),
      host: t('connection.host'),
      port: t('connection.port'),
      username: t('connection.username'),
      password: t('connection.password'),
      database: t('connection.database'),
      connectSuccess: t('connection.connectSuccess'),
      connectFailed: t('connection.connectFailed'),
      disconnectConfirm: t('connection.disconnectConfirm'),
      disconnectSuccess: t('connection.disconnectSuccess'),
      noConnections: t('connection.noConnections'),
      noConnectionsDesc: t('connection.noConnectionsDesc')
    },

    // 数据库相关翻译
    database: {
      title: t('database.title'),
      tables: t('database.tables'),
      views: t('database.views'),
      welcome: t('database.welcome'),
      welcomeDesc: t('database.welcomeDesc'),
      selectDatabase: t('database.selectDatabase'),
      selectTable: t('database.selectTable')
    },

    // 表格相关翻译
    table: {
      title: t('table.title'),
      data: t('table.data'),
      structure: t('table.structure'),
      showRecords: (count: number) => t('table.showRecords', { count }),
      totalRecords: (start: number, end: number, total: number) =>
        t('table.totalRecords', { start, end, total }),
      noData: t('table.noData')
    },

    // 查询相关翻译
    query: {
      title: t('query.title'),
      placeholder: t('query.placeholder'),
      execute: t('query.execute'),
      result: t('query.result'),
      executionTime: (time: number) => t('query.executionTime', { time }),
      executeSuccess: (time: number) => t('query.executeSuccess', { time }),
      executeFailed: t('query.executeFailed'),
      noQuery: t('query.noQuery'),
      noResult: t('query.noResult'),
      recordCount: (total: number) => t('query.recordCount', { total })
    }
  }
}

export default useI18n