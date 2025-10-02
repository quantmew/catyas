import React, { useEffect, useState } from 'react'
import TitlebarMacOS from './TitlebarMacOS'
import TitlebarWindows from './TitlebarWindows'

const Titlebar: React.FC = () => {
  const [platform, setPlatform] = useState<NodeJS.Platform | null>(null)

  useEffect(() => {
    if (window.electronAPI?.platform) {
      setPlatform(window.electronAPI.platform)
    }
  }, [])

  // In web mode (no electronAPI), don't render titlebar
  if (!window.electronAPI) return null

  // Default to Windows style if platform not detected yet
  if (!platform) {
    return <TitlebarWindows />
  }

  // Render based on platform
  if (platform === 'darwin') {
    return <TitlebarMacOS />
  }

  // Windows, Linux, and others use Windows style
  return <TitlebarWindows />
}

export default Titlebar