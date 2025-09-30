import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Space,
  Typography,
  Tabs,
  Button,
  Upload,
  message
} from 'antd'
import { DatabaseOutlined, UploadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { DatabaseConfig } from '../types/database'

const { Option } = Select
const { Title, Text } = Typography
const { TabPane } = Tabs

interface ConnectionDialogProps {
  visible: boolean
  onCancel: () => void
  onOk: (config: DatabaseConfig) => void
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({ visible, onCancel, onOk }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dbType, setDbType] = useState<string>('mysql')

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onOk(values)
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setDbType('mysql')
    onCancel()
  }

  const handleDbTypeChange = (value: string) => {
    setDbType(value)
    form.setFieldValue('type', value)

    // 设置默认端口
    const defaultPorts: { [key: string]: number } = {
      mysql: 3306,
      mariadb: 3306,
      postgresql: 5432,
      mongodb: 27017,
      redis: 6379,
      oracle: 1521,
      sqlserver: 1433
    }

    if (defaultPorts[value]) {
      form.setFieldValue('port', defaultPorts[value])
    }
  }

  const renderFormFields = () => {
    if (dbType === 'sqlite') {
      return (
        <Form.Item
          label="数据库文件"
          name="filePath"
          rules={[{ required: true, message: '请选择数据库文件' }]}
        >
          <Input placeholder="选择 SQLite 数据库文件路径" />
        </Form.Item>
      )
    }

    return (
      <>
        <Form.Item
          label="主机地址"
          name="host"
          rules={[{ required: true, message: '请输入主机地址' }]}
        >
          <Input placeholder="localhost" />
        </Form.Item>

        <Form.Item
          label="端口"
          name="port"
          rules={[{ required: true, message: '请输入端口号' }]}
        >
          <InputNumber min={1} max={65535} placeholder="3306" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: dbType !== 'redis', message: '请输入用户名' }]}
        >
          <Input placeholder="root" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        {!['redis'].includes(dbType) && (
          <Form.Item
            label="数据库"
            name="database"
            rules={[{ required: dbType === 'postgresql', message: '请输入数据库名称' }]}
          >
            <Input placeholder={dbType === 'postgresql' ? 'postgres' : '可选，连接后选择'} />
          </Form.Item>
        )}

        {dbType === 'redis' && (
          <Form.Item
            label="数据库编号"
            name="database"
          >
            <InputNumber min={0} max={15} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item
          label="使用 SSL"
          name="ssl"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          <span>{t('connection.newConnection')}</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          ssl: false
        }}
      >
        <Form.Item
          label={t('connection.connectionName')}
          name="name"
          rules={[{ required: true, message: t('validation.connectionNameRequired') }]}
        >
          <Input placeholder={t('connection.placeholder.connectionName')} />
        </Form.Item>

        <Form.Item
          label={t('connection.databaseType')}
          name="type"
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select onChange={handleDbTypeChange} value={dbType}>
            <Option value="mysql">
              <Space>
                <DatabaseOutlined style={{ color: '#1890ff' }} />
                MySQL
              </Space>
            </Option>
            <Option value="mariadb">
              <Space>
                <DatabaseOutlined style={{ color: '#1890ff' }} />
                MariaDB
              </Space>
            </Option>
            <Option value="postgresql">
              <Space>
                <DatabaseOutlined style={{ color: '#336791' }} />
                PostgreSQL
              </Space>
            </Option>
            <Option value="sqlite">
              <Space>
                <DatabaseOutlined style={{ color: '#003B57' }} />
                SQLite
              </Space>
            </Option>
            <Option value="mongodb">
              <Space>
                <DatabaseOutlined style={{ color: '#47A248' }} />
                MongoDB
              </Space>
            </Option>
            <Option value="redis">
              <Space>
                <DatabaseOutlined style={{ color: '#DC382D' }} />
                Redis
              </Space>
            </Option>
            <Option value="oracle">
              <Space>
                <DatabaseOutlined style={{ color: '#F80000' }} />
                Oracle
              </Space>
            </Option>
            <Option value="sqlserver">
              <Space>
                <DatabaseOutlined style={{ color: '#CC2927' }} />
                SQL Server
              </Space>
            </Option>
          </Select>
        </Form.Item>

        {renderFormFields()}
      </Form>
    </Modal>
  )
}

export default ConnectionDialog