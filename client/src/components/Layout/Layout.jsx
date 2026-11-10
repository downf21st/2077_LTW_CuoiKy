import { useEffect, useState } from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import './Layout.css'

// Khi Nam đẩy Router lên: đổi `children` thành <Outlet /> (import từ react-router-dom)
function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isSidebarOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen])

  return (
    <div className="layout">
      <Header />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="layout__main">{children}</main>
      <footer className="layout__footer" />
    </div>
  )
}

export default Layout
