import { useEffect, useState } from 'react'
import App from './App'
import MySQLConnectionPage from './pages/MySQLConnectionPage'

export default function Router() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash.slice(1) || '/')

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.slice(1) || '/')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  switch (currentRoute) {
    case '/mysql-connection':
      return <MySQLConnectionPage />
    default:
      return <App />
  }
}
