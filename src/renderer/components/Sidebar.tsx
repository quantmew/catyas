import React from 'react'
import { Layout } from 'antd'
import ConnectionTree from './ConnectionTree'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  return (
    <Sider width={240} theme="light" className="sidebar">
      <div className="connection-tree">
        <ConnectionTree />
      </div>
    </Sider>
  )
}

export default Sidebar
