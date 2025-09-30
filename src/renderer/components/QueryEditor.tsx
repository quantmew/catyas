import React, { useState } from 'react'
import { Input, Button, Space, Table, message, Divider, Typography } from 'antd'
import { PlayCircleOutlined, ClearOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { TextArea } = Input
const { Title, Text } = Typography

interface QueryEditorProps {
  connectionId: string
}

const QueryEditor: React.FC<QueryEditorProps> = ({ connectionId }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState<number>(0)

  const executeQuery = async () => {
    if (!query.trim()) {
      message.warning('请输入 SQL 语句')
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      const response = await window.electronAPI.database.query(connectionId, query.trim())
      const endTime = Date.now()
      setExecutionTime(endTime - startTime)

      if (response.success) {
        setResult(response.data)
        message.success(`查询执行成功，耗时 ${endTime - startTime}ms`)
      } else {
        message.error(`查询执行失败: ${response.error}`)
        setResult(null)
      }
    } catch (error) {
      const endTime = Date.now()
      setExecutionTime(endTime - startTime)
      message.error(`查询执行失败: ${error.message}`)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setResult(null)
    setExecutionTime(0)
  }

  const renderResult = () => {
    if (!result) return null

    if (Array.isArray(result) && result.length > 0) {
      const firstRow = result[0]
      const columns: ColumnsType<any> = Object.keys(firstRow).map(key => ({
        title: key,
        dataIndex: key,
        key,
        width: 150,
        ellipsis: true,
        render: (value: any) => {
          if (value === null) return <Text type="secondary">NULL</Text>
          if (typeof value === 'object') return <Text code>{JSON.stringify(value)}</Text>
          return <Text>{String(value)}</Text>
        }
      }))

      return (
        <Table
          columns={columns}
          dataSource={result.map((row, index) => ({ ...row, __key: index }))}
          rowKey="__key"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: 50,
            pageSizeOptions: ['20', '50', '100', '200']
          }}
          scroll={{ x: 'max-content', y: 400 }}
          size="small"
        />
      )
    }

    if (Array.isArray(result) && result.length === 0) {
      return <Text type="secondary">查询结果为空</Text>
    }

    return (
      <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
        <Text code>{JSON.stringify(result, null, 2)}</Text>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Space direction="vertical" size={16} style={{ width: '100%', flex: 1 }}>
        <div>
          <Space style={{ marginBottom: '8px' }}>
            <Title level={5} style={{ margin: 0 }}>SQL 查询编辑器</Title>
          </Space>

          <TextArea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="在此输入 SQL 语句..."
            autoSize={{ minRows: 6, maxRows: 12 }}
            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
          />

          <Space style={{ marginTop: '8px' }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={executeQuery}
              loading={loading}
            >
              执行查询
            </Button>
            <Button icon={<ClearOutlined />} onClick={clearQuery}>
              清空
            </Button>
            {executionTime > 0 && (
              <Text type="secondary">执行时间: {executionTime}ms</Text>
            )}
          </Space>
        </div>

        {result && (
          <>
            <Divider />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Title level={5}>查询结果</Title>
              {renderResult()}
            </div>
          </>
        )}
      </Space>
    </div>
  )
}

export default QueryEditor