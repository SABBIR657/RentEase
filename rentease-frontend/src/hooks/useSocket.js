import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'

let socket = null
let isConnecting = false

export const getSocket = () => socket

export const connectSocket = (token, onNotification) => {
  // Already connected — do nothing
  if (socket?.connected) return socket

  // Already trying to connect — wait
  if (isConnecting) return null

  isConnecting = true

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
    isConnecting = false
  })

  socket.on('new_notification', (notification) => {
    if (onNotification) onNotification(notification)
  })

  socket.on('connect_error', (err) => {
    console.log('❌ Socket error:', err.message)
    isConnecting = false
  })

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Socket disconnected:', reason)
    isConnecting = false
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    isConnecting = false
  }
}

// This hook is called ONCE in App.jsx — just connects
export const useSocket = () => {
  const { token }        = useAuthStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!token) return
    connectSocket(token, addNotification)

    // Do NOT disconnect on cleanup
    // Socket must stay alive across page navigation
  }, [token])

  return socket
}

// Helper — wait for socket to be ready then run callback
export const withSocket = (callback, retries = 10) => {
  const s = getSocket()
  if (s?.connected) {
    callback(s)
    return
  }
  if (retries <= 0) {
    console.warn('Socket not available after retries')
    return
  }
  setTimeout(() => withSocket(callback, retries - 1), 300)
}