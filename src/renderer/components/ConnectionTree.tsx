import React, { useEffect } from 'react'
import { Tree, Typography, Space, Button, Popconfirm, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  DatabaseOutlined,
  TableOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import { useConnectionStore } from '../store/connectionStore'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'

const { Text } = Typography

const ConnectionTree: React.FC = () => {
  const navigate = useNavigate()
  const { connection } = useI18n()
  const {
    connections,
    selectedConnection,
    selectedDatabase,
    selectedTable,
    removeConnection,
    setSelectedConnection,
    setSelectedDatabase,
    setSelectedTable,
    loadDatabases,
    loadTables
  } = useConnectionStore()

  const getDbIcon = (type: string) => {
    const iconProps = { style: { color: '#1890ff' } }
    switch (type) {
      case 'mysql':
      case 'mariadb':
        return <DatabaseOutlined {...iconProps} />
      case 'postgresql':
        return <DatabaseOutlined {...iconProps} style={{ color: '#336791' }} />
      case 'sqlite':
        return <DatabaseOutlined {...iconProps} style={{ color: '#003B57' }} />
      case 'mongodb':
        return <DatabaseOutlined {...iconProps} style={{ color: '#47A248' }} />
      case 'redis':
        return <DatabaseOutlined {...iconProps} style={{ color: '#DC382D' }} />
      default:
        return <DatabaseOutlined {...iconProps} />
    }
  }

  const handleDisconnect = async (connectionId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await window.electronAPI.database.disconnect(connectionId)
      removeConnection(connectionId)
      message.success(connection.disconnectSuccess)
      navigate('/')
    } catch (error) {
      message.error(connection.disconnectFailed)
    }
  }

  const buildTreeData = (): DataNode[] => {
    return connections.map(connection => {
      const connectionNode: DataNode = {
        title: (
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              {getDbIcon(connection.type)}
              <Text strong>{connection.name}</Text>
            </Space>
            <Space>
              <Popconfirm
                title={connection.disconnectConfirm}
                onConfirm={(e) => handleDisconnect(connection.id, e!)}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DisconnectOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Space>
          </Space>
        ),
        key: `connection-${connection.id}`,
        icon: getDbIcon(connection.type),
        children: connection.databases?.map(database => ({
          title: (
            <Space>
              <FolderOutlined style={{ color: '#faad14' }} />
              <Text>{database}</Text>
            </Space>
          ),
          key: `database-${connection.id}-${database}`,
          icon: <FolderOutlined style={{ color: '#faad14' }} />,
          children: [
            {
              title: (
                <Space>
                  <FolderOpenOutlined style={{ color: '#1890ff' }} />
                  <Text>表</Text>
                </Space>
              ),
              key: `tables-${connection.id}-${database}`,
              icon: <FolderOpenOutlined style={{ color: '#1890ff' }} />,
              children: connection.tables?.[database]?.map(table => ({
                title: (
                  <Space>
                    <TableOutlined style={{ color: '#52c41a' }} />
                    <Text>{table}</Text>
                  </Space>
                ),
                key: `table-${connection.id}-${database}-${table}`,
                icon: <TableOutlined style={{ color: '#52c41a' }} />,
                isLeaf: true
              }))
            },
            {
              title: (
                <Space>
                  <FolderOutlined />
                  <Text>视图</Text>
                </Space>
              ),
              key: `views-${connection.id}-${database}`,
              icon: <FolderOutlined />,
              isLeaf: true
            },
            {
              title: (
                <Space>
                  <FolderOutlined />
                  <Text>函数</Text>
                </Space>
              ),
              key: `func-${connection.id}-${database}`,
              icon: <FolderOutlined />,
              isLeaf: true
            },
            {
              title: (
                <Space>
                  <FolderOutlined />
                  <Text>查询</Text>
                </Space>
              ),
              key: `query-${connection.id}-${database}`,
              icon: <FolderOutlined />,
              isLeaf: true
            },
            {
              title: (
                <Space>
                  <FolderOutlined />
                  <Text>备份</Text>
                </Space>
              ),
              key: `backup-${connection.id}-${database}`,
              icon: <FolderOutlined />,
              isLeaf: true
            }
          ]
        }))
      }
      return connectionNode
    })
  }

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length === 0) return

    const key = selectedKeys[0] as string
    const [type, connectionId, database, table] = key.split('-')

    switch (type) {
      case 'connection':
        setSelectedConnection(connectionId)
        navigate(`/connection/${connectionId}`)
        break
      case 'database':
        setSelectedConnection(connectionId)
        setSelectedDatabase(database)
        navigate(`/connection/${connectionId}/database/${database}`)
        break
      case 'tables':
        setSelectedConnection(connectionId)
        setSelectedDatabase(database)
        navigate(`/connection/${connectionId}/database/${database}`)
        break
      case 'table':
        setSelectedConnection(connectionId)
        setSelectedDatabase(database)
        setSelectedTable(table)
        navigate(`/connection/${connectionId}/database/${database}/table/${table}`)
        break
    }
  }

  const handleExpand = (expandedKeys: React.Key[], info: any) => {
    if (info.expanded) {
      const key = info.node.key as string
      const [type, connectionId, database] = key.split('-')

      if (type === 'connection') {
        loadDatabases(connectionId)
      } else if (type === 'tables') {
        loadTables(connectionId, database)
      }
    }
  }

  if (connections.length === 0) {
    return (
      <div className="empty-state">
        <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
        <Text type="secondary">{connection.noConnections}</Text>
        <Text type="secondary">{connection.noConnectionsDesc}</Text>
      </div>
    )
  }

  return (
    <Tree
      showIcon
      treeData={buildTreeData()}
      onSelect={handleSelect}
      onExpand={handleExpand}
      selectedKeys={
        selectedTable
          ? [`table-${selectedConnection}-${selectedDatabase}-${selectedTable}`]
          : selectedDatabase
          ? [`database-${selectedConnection}-${selectedDatabase}`]
          : selectedConnection
          ? [`connection-${selectedConnection}`]
          : []
      }
    />
  )
}

export default ConnectionTree
