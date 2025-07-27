import { useState, useEffect, useRef } from 'react'
import AdminNavbar from './Navbar'
import AdminSidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const sidebarRef = useRef(null)
  const { user } = useAuth()

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
    setIsHovering(false)
  }

  const handleSidebarOpen = () => {
    setSidebarOpen(true)
  }

  // Handle hover trigger on the left edge for desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth > 1024) {
        if (e.clientX <= 10 && !sidebarOpen) {
          setIsHovering(true)
          setSidebarOpen(true)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [sidebarOpen, isHovering])

  // Handle clicks outside sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 1024) {
        if (
          sidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !event.target.closest('[data-sidebar-trigger]')
        ) {
          handleSidebarClose()
        }
      } else if (isHovering && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsHovering(false)
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, isHovering])

  // Handle sidebar mouse enter/leave for hover behavior
  const handleSidebarMouseEnter = () => {
    if (window.innerWidth > 1024) {
      setIsHovering(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    if (window.innerWidth > 1024 && isHovering) {
      setTimeout(() => {
        setIsHovering(false)
        setSidebarOpen(false)
      }, 300)
    }
  }

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden" 
      style={{
        background: `
          linear-gradient(135deg, #000000ff 0%, #357ABD 25%, #2E5F8A 50%, #1E3A5F 75%, #0F1419 100%),
          radial-gradient(ellipse at top right, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, rgba(255,255,255,0.05) 0%, transparent 50%)
        `,  
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-white opacity-5"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Hover trigger area for desktop */}
      <div
        className="hidden lg:block fixed left-0 top-0 w-2 h-full z-40 cursor-pointer"
        onMouseEnter={() => {
          if (!sidebarOpen) {
            handleSidebarOpen()
            setIsHovering(true)
          }
        }}
      />

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className="fixed inset-y-0 left-0 z-50"
      >
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
          user={user}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col w-full relative z-10">
        {/* Navbar */}
        <div data-sidebar-trigger>
          <AdminNavbar onMenuToggle={handleMenuToggle} user={user} />
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto relative">
          <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleSidebarClose}
        />
      )}

      {/* Desktop Edge Indicator */}
      {isHovering && !sidebarOpen && (
        <div className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-blue-400 rounded-r-md z-50 transition-all duration-200 shadow-lg" />
      )}
    </div>
  )
}