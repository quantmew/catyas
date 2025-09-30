import React, { useState, useEffect } from 'react'
import { Table, Typography, Space, Spin, message, Tag, Layout, List, Divider } from 'antd'
import { TableOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Sider, Content } = Layout

interface TableViewProps {
  connectionId: string
  database: string
  table: string
}

const TableView: React.FC<TableViewProps> = ({ connectionId, database, table }) => {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<ColumnsType<any>>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0
  })
  const [schema, setSchema] = useState<any[]>([])
  const [selectedField, setSelectedField] = useState<any | null>(null)

  const loadTableData = async (page: number = 1, pageSize: number = 100) => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const result = await window.electronAPI.database.getTableData(
        connectionId,
        database,
        table,
        pageSize,
        offset
      )

      if (result.success && result.data.length > 0) {
        const firstRow = result.data[0]
        const tableColumns: ColumnsType<any> = Object.keys(firstRow).map(key => ({
          title: key,
          dataIndex: key,
          key,
          width: 150,
          ellipsis: true,
          render: (value: any) => {
            if (value === null) {
              return <Tag color="default">NULL</Tag>
            }
            if (typeof value === 'boolean') {
              return <Tag color={value ? 'success' : 'error'}>{value.toString()}</Tag>
            }
            if (typeof value === 'object') {
              return <Text code>{JSON.stringify(value)}</Text>
            }
            return <Text>{String(value)}</Text>
          }
        }))

        setColumns(tableColumns)
        setData(result.data.map((row, index) => ({ ...row, __rowKey: `${offset + index}` })))
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total: result.data.length < pageSize ? offset + result.data.length : (page * pageSize) + 1
        }))
      } else {
        setColumns([])
        setData([])
        setPagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      message.error(`加载表数据失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connectionId && database && table) {
      loadTableData()
      // load schema
      window.electronAPI.database
        .getTableSchema(connectionId, database, table)
        .then((res) => {
          if (res.success) {
            setSchema(res.data)
            setSelectedField(res.data[0] || null)
          } else {
            setSchema([])
            setSelectedField(null)
          }
        })
        .catch(() => {
          setSchema([])
          setSelectedField(null)
        })
    }
  }, [connectionId, database, table])

  const handleTableChange = (paginationConfig: any) => {
    loadTableData(paginationConfig.current, paginationConfig.pageSize)
  }

  return (
    <Layout className="table-view">
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="table-header">
          <Space direction="vertical" size={8}>
            <Space>
              <TableOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>
                {table}
              </Title>
            </Space>
            <Text type="secondary">
              数据库: {database} | 显示 {pagination.pageSize} 条记录
            </Text>
          </Space>
        </div>

        <div className="table-content">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="__rowKey"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total}+ 条记录`,
                pageSizeOptions: ['50', '100', '200', '500']
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
              size="small"
            />
          </Spin>
        </div>
      </Content>

      <Sider width={280} theme="light" style={{ borderLeft: '1px solid #e8e8e8', padding: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>字段</Title>
          <List
            size="small"
            bordered
            dataSource={schema}
            style={{ maxHeight: 260, overflow: 'auto' }}
            renderItem={(item: any) => (
              <List.Item
                onClick={() => setSelectedField(item)}
                style={{ cursor: 'pointer', background: selectedField?.name === item.name ? '#e6f7ff' : undefined }}
              >
                <Space>
                  <Text strong>{item.name}</Text>
                  <Tag color="blue">{item.type}</Tag>
                </Space>
              </List.Item>
            )}
          />

          <Divider style={{ margin: '8px 0' }} />
          <Title level={5} style={{ margin: 0 }}>字段信息</Title>
          {selectedField ? (
            <Space direction="vertical" size={4}>
              <Text type="secondary">名称</Text>
              <Text>{selectedField.name}</Text>
              <Text type="secondary">类型</Text>
              <Text>{selectedField.type}</Text>
              <Text type="secondary">不是 NULL</Text>
              <Text>{selectedField.not_null ? '是' : '否'}</Text>
              <Text type="secondary">默认值</Text>
              <Text>{selectedField.default_value ?? '--'}</Text>
              {selectedField.comment && (
                <>
                  <Text type="secondary">备注</Text>
                  <Text>{selectedField.comment}</Text>
                </>
              )}
            </Space>
          ) : (
            <Text type="secondary">无字段信息</Text>
          )}
        </Space>
      </Sider>
    </Layout>
  )
}

export default TableView
