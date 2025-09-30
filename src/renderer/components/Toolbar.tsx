import React from 'react'
import { Button, Space, Divider } from 'antd'
import {
  PlayCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const Toolbar: React.FC = () => {
  return (
    <div className="toolbar">
      <Space size={8}>
        <Button type="primary" icon={<PlayCircleOutlined />}>
          执行
        </Button>
        <Button icon={<ReloadOutlined />}>
          刷新
        </Button>

        <Divider type="vertical" />

        <Button icon={<PlusOutlined />}>
          新建表
        </Button>
        <Button icon={<EditOutlined />}>
          设计表
        </Button>
        <Button icon={<DeleteOutlined />} danger>
          删除表
        </Button>

        <Divider type="vertical" />

        <Button icon={<ImportOutlined />}>
          导入
        </Button>
        <Button icon={<ExportOutlined />}>
          导出
        </Button>
      </Space>
    </div>
  )
}

export default Toolbar