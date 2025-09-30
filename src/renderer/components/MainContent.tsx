import React from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Space } from 'antd'
import { DatabaseOutlined, TableOutlined } from '@ant-design/icons'
import TableView from './TableView'
import QueryEditor from './QueryEditor'
import DatabaseTables from './DatabaseTables'
import Toolbar from './Toolbar'
import { useI18n } from '../hooks/useI18n'

const { Title, Text } = Typography

const MainContent: React.FC = () => {
  const { connectionId, database, table } = useParams()
  const { database: db } = useI18n()

  const renderContent = () => {
    if (table && database && connectionId) {
      return <TableView connectionId={connectionId} database={database} table={table} />
    }

    if (database && connectionId) {
      return (
        <div className="content-area" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <DatabaseTables connectionId={connectionId} database={database} />
          </div>
        </div>
      )
    }

    if (connectionId) {
      return (
        <div className="content-area">
          <div style={{ padding: '24px' }}>
            <Space direction="vertical" size={16}>
              <Space>
                <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={3}>{db.title}</Title>
              </Space>
              <Text type="secondary">
                {db.selectDatabase}
              </Text>
            </Space>
          </div>
        </div>
      )
    }

    return (
      <div className="empty-state">
        <DatabaseOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
        <Title level={3} type="secondary">{db.welcome}</Title>
        <Text type="secondary">{db.welcomeDesc}</Text>
      </div>
    )
  }

  return (
    <div className="main-content">
      {(connectionId || database || table) && <Toolbar />}
      {renderContent()}
    </div>
  )
}

export default MainContent
