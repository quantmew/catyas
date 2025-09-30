import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Titlebar, Color } from 'custom-electron-titlebar'
import 'custom-electron-titlebar/lib/titlebar.css'

// Initialize custom titlebar
const isDark = document.documentElement.classList.contains('dark')
new Titlebar({
  backgroundColor: Color.fromHex(isDark ? '#1f2937' : '#e5e7eb'),
  titleHorizontalAlignment: 'left',
  menu: null,
  title: 'Catyas',
})

// Offset app content below the titlebar
document.body.style.marginTop = '30px'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
