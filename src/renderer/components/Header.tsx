import React from 'react'
import { Layout, Button, Space, Typography, Dropdown, Menu } from 'antd'
import { PlusOutlined, DatabaseOutlined, GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Header: AntHeader } = Layout
const { Title } = Typography

interface HeaderProps {
  onNewConnection: () => void
}

const Header: React.FC<HeaderProps> = ({ onNewConnection }) => {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
  }

  const languageMenu = (
    <Menu
      items={[
        {
          key: 'zh-CN',
          label: '简体中文',
          onClick: () => handleLanguageChange('zh-CN')
        },
        {
          key: 'en-US',
          label: 'English',
          onClick: () => handleLanguageChange('en-US')
        },
        {
          key: 'ja-JP',
          label: '日本語',
          onClick: () => handleLanguageChange('ja-JP')
        }
      ]}
    />
  )

  const getCurrentLanguageLabel = () => {
    switch (i18n.language) {
      case 'zh-CN':
        return '简体中文'
      case 'en-US':
        return 'English'
      case 'ja-JP':
        return '日本語'
      default:
        return '简体中文'
    }
  }

  return (
    <AntHeader className="app-header">
      <Space size={16} style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <DatabaseOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Catyas
          </Title>
        </Space>

        <Space>
          <Dropdown overlay={languageMenu} placement="bottomRight">
            <Button type="text" style={{ color: 'white' }}>
              <Space>
                <GlobalOutlined />
                {getCurrentLanguageLabel()}
              </Space>
            </Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onNewConnection}
          >
            {t('header.newConnection')}
          </Button>
        </Space>
      </Space>
    </AntHeader>
  )
}

export default Header