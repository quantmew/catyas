import React from 'react'
import { Space } from 'antd'
import {
  LinkOutlined,
  PlusSquareOutlined,
  TableOutlined,
  AppstoreOutlined,
  FunctionOutlined,
  TeamOutlined,
  CloudDownloadOutlined,
  ScheduleOutlined,
  ClusterOutlined,
  BarChartOutlined
} from '@ant-design/icons'

interface RibbonItemProps {
  icon: React.ReactNode
  label: string
}

const RibbonItem: React.FC<RibbonItemProps> = ({ icon, label }) => (
  <div className="ribbon-item">
    <div className="ribbon-icon">{icon}</div>
    <div className="ribbon-label">{label}</div>
  </div>
)

const TopRibbon: React.FC = () => {
  return (
    <div className="top-ribbon">
      <Space size={12} wrap>
        <RibbonItem icon={<LinkOutlined />} label="连接" />
        <RibbonItem icon={<PlusSquareOutlined />} label="新建查询" />
        <RibbonItem icon={<TableOutlined />} label="表" />
        <RibbonItem icon={<AppstoreOutlined />} label="视图" />
        <RibbonItem icon={<FunctionOutlined />} label="函数" />
        <RibbonItem icon={<TeamOutlined />} label="用户" />
        <RibbonItem icon={<CloudDownloadOutlined />} label="备份" />
        <RibbonItem icon={<ScheduleOutlined />} label="自动运行" />
        <RibbonItem icon={<ClusterOutlined />} label="模型" />
        <RibbonItem icon={<BarChartOutlined />} label="图表" />
      </Space>
    </div>
  )
}

export default TopRibbon

