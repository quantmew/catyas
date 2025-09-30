import React, { useEffect, useState, useMemo } from 'react'
import { Table, Typography, Space, Button, Divider, Layout, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Sider, Content } = Layout

interface DatabaseTablesProps {
  connectionId: string
  database: string
}

interface TableInfoRow {
  name: string
  rows?: number
  engine?: string
  data_length?: number
  index_length?: number
  total_length?: number
  create_time?: string
  update_time?: string
  auto_increment?: number
  table_collation?: string
  row_format?: string
  total_size?: number
  table_size?: number
}

const formatBytes = (n?: number) => {
  if (!n && n !== 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(2)} ${units[i]}`
}

const DatabaseTables: React.FC<DatabaseTablesProps> = ({ connectionId, database }) => {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<TableInfoRow[]>([])
  const [selected, setSelected] = useState<TableInfoRow | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await window.electronAPI.database.getTablesInfo(connectionId, database)
        if (res.success) {
          setRows(res.data)
        } else {
          setRows([])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [connectionId, database])

  const columns: ColumnsType<TableInfoRow> = useMemo(() => [
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    { title: '自动递增', dataIndex: 'auto_increment', key: 'auto_increment', width: 120, render: (v) => v ?? '-' },
    { title: '修改日期', dataIndex: 'update_time', key: 'update_time', width: 180, render: (v) => v ?? '-' },
    { title: '数据长度', dataIndex: 'data_length', key: 'data_length', width: 120, render: (v) => (v != null ? formatBytes(v) : '-') },
    { title: '引擎', dataIndex: 'engine', key: 'engine', width: 120, render: (v) => v ?? '-' },
    { title: '行', dataIndex: 'rows', key: 'rows', width: 100, render: (v) => v ?? '-' }
  ], [])

  const onOpen = () => {
    if (selected) {
      navigate(`/connection/${connectionId}/database/${database}/table/${selected.name}`)
    }
  }

  return (
    <Layout style={{ height: '100%', background: 'white', overflow: 'hidden' }}>
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="table-header">
          <Space direction="vertical" size={8}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>对象</Title>
            </Space>
            <Space>
              <Button type="primary" icon={<FolderOpenOutlined />} onClick={onOpen} disabled={!selected}>打开表</Button>
              <Button icon={<EditOutlined />}>设计表</Button>
              <Button icon={<PlusOutlined />}>新建表</Button>
              <Button icon={<DeleteOutlined />} danger>删除表</Button>
              <Divider type="vertical" />
              <Button icon={<ImportOutlined />}>导入向导</Button>
              <Button icon={<ExportOutlined />}>导出向导</Button>
            </Space>
          </Space>
        </div>

        <div className="table-content">
          <Table
            size="small"
            loading={loading}
            rowKey={(r) => r.name}
            columns={columns}
            dataSource={rows}
            onRow={(record) => ({
              onClick: () => setSelected(record),
              onDoubleClick: () => navigate(`/connection/${connectionId}/database/${database}/table/${record.name}`)
            })}
            pagination={{ pageSize: 50, showTotal: (t) => `共 ${t} 项` }}
            scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
          />
        </div>
      </Content>

      <Sider width={280} theme="light" style={{ borderLeft: '1px solid #e8e8e8', padding: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>{selected ? selected.name : '选择一个表'}</Title>
          {selected ? (
            <Space direction="vertical" size={4}>
              <Text type="secondary">库</Text>
              <Text>{database}</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary">记录数</Text>
              <Text>{selected.rows ?? '-'}</Text>
              <Text type="secondary">引擎</Text>
              <Text>{selected.engine ?? '-'}</Text>
              <Text type="secondary">数据长度</Text>
              <Text>{formatBytes(selected.data_length)}</Text>
              <Text type="secondary">索引长度</Text>
              <Text>{formatBytes(selected.index_length)}</Text>
              <Text type="secondary">总大小</Text>
              <Text>{formatBytes(selected.total_length)}</Text>
              <Text type="secondary">自增</Text>
              <Text>{selected.auto_increment ?? 0}</Text>
              <Text type="secondary">行格式</Text>
              <Text>{selected.row_format ?? '-'}</Text>
              <Text type="secondary">创建时间</Text>
              <Text>{selected.create_time ?? '-'}</Text>
              <Text type="secondary">修改时间</Text>
              <Text>{selected.update_time ?? '-'}</Text>
              <Text type="secondary">字符集</Text>
              <Text>{selected.table_collation ? selected.table_collation.split('_')[0] : '-'}</Text>
              <Text type="secondary">排序规则</Text>
              <Text>{selected.table_collation ?? '-'}</Text>
            </Space>
          ) : (
            <Text type="secondary">在左侧选择一个表查看详细信息</Text>
          )}
        </Space>
      </Sider>
    </Layout>
  )
}

export default DatabaseTables
