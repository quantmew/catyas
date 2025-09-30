import React, { useState, useEffect } from 'react'
import { Layout, message } from 'antd'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useConnectionStore } from './store/connectionStore'
import LocaleProvider from './components/LocaleProvider'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import ConnectionDialog from './components/ConnectionDialog'
import TopRibbon from './components/TopRibbon'

const { Content } = Layout

const App: React.FC = () => {
  const { t } = useTranslation()
  const [connectionDialogVisible, setConnectionDialogVisible] = useState(false)
  const { connections, addConnection } = useConnectionStore()

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuAction((action: string) => {
        switch (action) {
          case 'new-connection':
            setConnectionDialogVisible(true)
            break
          case 'about':
            message.info(`${t('app.title')} v1.0.0`)
            break
        }
      })
    }
  }, [])

  const handleCreateConnection = async (config: any) => {
    try {
      const result = await window.electronAPI.database.connect(config)
      if (result.success) {
        addConnection({
          id: result.connectionId,
          name: config.name,
          type: config.type,
          config,
          connected: true
        })
        message.success(t('connection.connectSuccess'))
        setConnectionDialogVisible(false)
      } else {
        message.error(`${t('connection.connectFailed')}: ${result.error}`)
      }
    } catch (error) {
      message.error(`${t('connection.connectFailed')}: ${error.message}`)
    }
  }

  return (
    <LocaleProvider>
      <Layout className="app-layout">
        <Header onNewConnection={() => setConnectionDialogVisible(true)} />
        <TopRibbon />
        <Layout className="app-content">
          <Sidebar />
          <Content className="main-content">
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/connection/:connectionId" element={<MainContent />} />
              <Route path="/connection/:connectionId/database/:database" element={<MainContent />} />
              <Route path="/connection/:connectionId/database/:database/table/:table" element={<MainContent />} />
            </Routes>
          </Content>
        </Layout>

        <ConnectionDialog
          visible={connectionDialogVisible}
          onCancel={() => setConnectionDialogVisible(false)}
          onOk={handleCreateConnection}
        />
      </Layout>
    </LocaleProvider>
  )
}

export default App
