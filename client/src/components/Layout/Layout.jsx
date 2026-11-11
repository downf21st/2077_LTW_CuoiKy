import { useEffect, useRef, useState } from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import './Layout.css'

// Khi Nam đẩy Router lên: đổi `children` thành <Outlet /> (import từ react-router-dom)
function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toggleRef = useRef(null)
  const layoutRef = useRef(null)

  useEffect(() => {
    const layout = layoutRef.current
    const footer = layout.querySelector('.footer')
    const panel = layout.querySelector('.sidebar__panel')
    const role = layout.querySelector('.sidebar__role')
    const nav = layout.querySelector('.sidebar__nav')
    const login = layout.querySelector('.sidebar__login')
    const updateSidebarBounds = () => {
      const viewportHeight = document.documentElement.clientHeight
      const availableHeight = Math.max(0, viewportHeight - 6)
      const minContentHeight = role.offsetHeight + login.offsetHeight
        + parseFloat(getComputedStyle(panel).paddingTop)
        + parseFloat(getComputedStyle(nav).marginTop)
      const minHeight = Math.min(minContentHeight, availableHeight)
      const footerTop = footer.getBoundingClientRect().top
      const top = Math.min(3, footerTop - 3 - minHeight)
      const height = Math.max(0, Math.min(availableHeight, footerTop - top - 3))
      layout.style.setProperty('--sidebar-top', `${top}px`)
      layout.style.setProperty('--sidebar-height', `${height}px`)
    }
    updateSidebarBounds()
    window.addEventListener('scroll', updateSidebarBounds, { passive: true })
    window.addEventListener('resize', updateSidebarBounds)
    const observer = new ResizeObserver(updateSidebarBounds)
    observer.observe(layout)
    observer.observe(footer)
    observer.observe(role)
    observer.observe(login)
    return () => {
      window.removeEventListener('scroll', updateSidebarBounds)
      window.removeEventListener('resize', updateSidebarBounds)
      observer.disconnect()
    }
  }, [])

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    toggleRef.current?.focus()
  }

  useEffect(() => {
    if (!isSidebarOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen])

  return (
    <div className="layout" ref={layoutRef}>
      <Header />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
        onClose={closeSidebar}
        toggleRef={toggleRef}
      />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
