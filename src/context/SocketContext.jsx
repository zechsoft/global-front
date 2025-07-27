import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import config from '../config/config' // Import the config file

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, getAuthToken } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const socketRef = useRef(null)

  // Use config instead of process.env
  const API_BASE_URL = config.API_BASE_URL

  useEffect(() => {
    if (user?.email && getAuthToken()) {
      connectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [user, getAuthToken])

  const connectSocket = () => {
    try {
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      const newSocket = io(API_BASE_URL, {
        auth: {
          token: getAuthToken()
        },
        transports: ['websocket', 'polling'],
        autoConnect: true
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setIsConnected(true)
        newSocket.emit('join-rooms')
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      // User status events
      newSocket.on('user-online', (userData) => {
        setOnlineUsers(prev => {
          const existing = prev.find(u => u.userId === userData.userId)
          if (existing) return prev
          return [...prev, userData]
        })
      })

      newSocket.on('user-offline', (userData) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId))
      })

      // Typing events
      newSocket.on('user-typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatRoomId]: {
            ...prev[data.chatRoomId],
            [data.userId]: {
              userName: data.userName,
              timestamp: Date.now()
            }
          }
        }))

        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev }
            if (updated[data.chatRoomId]) {
              delete updated[data.chatRoomId][data.userId]
              if (Object.keys(updated[data.chatRoomId]).length === 0) {
                delete updated[data.chatRoomId]
              }
            }
            return updated
          })
        }, 3000)
      })

      newSocket.on('user-stopped-typing', (data) => {
        setTypingUsers(prev => {
          const updated = { ...prev }
          if (updated[data.chatRoomId]) {
            delete updated[data.chatRoomId][data.userId]
            if (Object.keys(updated[data.chatRoomId]).length === 0) {
              delete updated[data.chatRoomId]
            }
          }
          return updated
        })
      })

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error)
      })

    } catch (error) {
      console.error('Error connecting socket:', error)
    }
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
      setOnlineUsers([])
      setTypingUsers({})
    }
  }

  const sendMessage = (chatRoomId, content, messageType = 'text', tempId = null) => {
    if (socket && isConnected) {
      socket.emit('send-message', {
        chatRoomId,
        content,
        messageType,
        tempId
      })
    }
  }

  const markMessagesAsRead = (chatRoomId) => {
    if (socket && isConnected) {
      socket.emit('mark-messages-read', { chatRoomId })
    }
  }

  const startTyping = (chatRoomId) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { chatRoomId })
    }
  }

  const stopTyping = (chatRoomId) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { chatRoomId })
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId)
  }

  const getUsersTypingInChat = (chatRoomId) => {
    const chatTyping = typingUsers[chatRoomId]
    if (!chatTyping) return []
    
    return Object.keys(chatTyping).map(userId => ({
      userId,
      userName: chatTyping[userId].userName
    }))
  }

  const value = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    isUserOnline,
    getUsersTypingInChat,
    connectSocket,
    disconnectSocket
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}