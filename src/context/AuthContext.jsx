import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        // Check localStorage first (remember me)
        let storedUser = localStorage.getItem("user")
        let storedToken = localStorage.getItem("token")
        
        if (!storedUser) {
          // Check sessionStorage if not in localStorage
          storedUser = sessionStorage.getItem("user")
          storedToken = sessionStorage.getItem("token")
        }
        
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        // Clear invalid data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("token")
      }
      setIsLoading(false)
    }

    checkExistingSession()
  }, [])

  // API login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const data = { email, password }
      
      console.log('Attempting login with:', { email, passwordLength: password.length })
      
      const response = await fetch("http://localhost:8000/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          const errorText = await response.text()
          console.log('Error response text:', errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const userData = await response.json()
      console.log('Login successful, user data:', userData)
      
      // Extract token from response - adjust field name based on your API
      const authToken = userData.token || userData.accessToken || userData.authToken || null
      
      // Create user object
      const userInfo = {
        id: userData.id || userData._id || `${userData.role}-${Date.now()}`,
        email: userData.displayMail || userData.email,
        role: userData.role,
        isAuthenticated: userData.isAuthenticated || true,
        mobile: userData.mobile,
        name: userData.displayName || userData.name,
        location: userData.location,
        bio: userData.bio,
        companyName: userData.companyName || 'Global India Corporation',
        clientId: userData.clientId || (userData.role === 'client' ? userData.id : null)
      }

      // Store user info and token based on remember me preference
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem("user", JSON.stringify(userInfo))
      if (authToken) {
        storage.setItem("token", authToken)
      }

      // Update context state
      setUser(userInfo)
      setToken(authToken)
      
      console.log('User set in context:', userInfo)
      console.log('Token set:', authToken ? 'Token present' : 'No token received')
      
      return { success: true, user: userInfo }
      
    } catch (error) {
      console.error('Login error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.')
      }
      throw error
    }
  }

  // Fallback login for demo purposes (when API is not available)
  const demoLogin = (email, password) => {
    const users = {
      // Admin user - can access all client data
      'admin@example.com': {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
        companyName: 'Global India Corporation',
        isAuthenticated: true
      },
      
      // Client users - each has their own data space
      'client1@example.com': {
        id: 'client-1',
        email: 'client1@example.com',
        role: 'client',
        name: 'Client User 1',
        companyName: 'ABC Manufacturing Ltd',
        clientId: 'CLIENT001',
        isAuthenticated: true
      },
      'client2@example.com': {
        id: 'client-2',
        email: 'client2@example.com',
        role: 'client',
        name: 'Client User 2',
        companyName: 'XYZ Industries Pvt Ltd',
        clientId: 'CLIENT002',
        isAuthenticated: true
      },
      'client3@example.com': {
        id: 'client-3',
        email: 'client3@example.com',
        role: 'client',
        name: 'Client User 3',
        companyName: 'PQR Enterprises',
        clientId: 'CLIENT003',
        isAuthenticated: true
      }
    }

    // Simple password validation (use 'password' for demo)
    if (users[email] && password === 'password') {
      const demoToken = `demo-token-${Date.now()}`
      setUser(users[email])
      setToken(demoToken)
      sessionStorage.setItem("user", JSON.stringify(users[email]))
      sessionStorage.setItem("token", demoToken)
      return { success: true, user: users[email] }
    }
    throw new Error('Invalid email or password')
  }

  const logout = async () => {
    try {
      // Call logout API endpoint to invalidate server-side session
      await fetch("http://localhost:8000/api/logout", { 
        credentials: 'include',
        method: 'POST'
      })
    } catch (error) {
      console.log('Logout API call failed:', error)
    }
    
    // Clear local state and storage
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")
  }

  // Helper function to get current auth token
  const getAuthToken = () => {
    if (token) return token
    
    // Fallback: try to get from storage
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }

  // Get all clients (admin only)
  const getAllClients = () => {
    if (user?.role !== 'admin') return []
    
    return [
      { id: 'client-1', name: 'Client User 1', companyName: 'ABC Manufacturing Ltd', clientId: 'CLIENT001', email: 'client1@example.com' },
      { id: 'client-2', name: 'Client User 2', companyName: 'XYZ Industries Pvt Ltd', clientId: 'CLIENT002', email: 'client2@example.com' },
      { id: 'client-3', name: 'Client User 3', companyName: 'PQR Enterprises', clientId: 'CLIENT003', email: 'client3@example.com' },
      { id: 'client-4', name: 'Client User 4', companyName: '123 Solutions Inc', clientId: 'CLIENT004', email: 'client4@example.com' },
      { id: 'client-5', name: 'Client User 5', companyName: 'DEF Technologies', clientId: 'CLIENT005', email: 'client5@example.com' }
    ]
  }

  // Check if user can access specific client data
  const canAccessClientData = (clientId) => {
    if (user?.role === 'admin') return true
    if (user?.role === 'client' && user?.clientId === clientId) return true
    return false
  }

  // Get current client context (for data filtering)
  const getCurrentClientContext = () => {
    if (user?.role === 'admin') {
      return 'ALL_CLIENTS'
    }
    if (user?.role === 'client') {
      return user.clientId
    }
    return null
  }

  const value = {
    user,
    token,
    getAuthToken,
    login,
    demoLogin,
    logout,
    getAllClients,
    canAccessClientData,
    getCurrentClientContext,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}