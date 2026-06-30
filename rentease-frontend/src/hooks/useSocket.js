import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'

let socket = null

export const useSocket = () => {
  const { token } = useAuthStore()
  const { addNotification, setUnreadCount } = useNotificationStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!token || initialized.current) return
    initialized.current = true

    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    })

    socket.on('connect', () => console.log('Socket connected'))

    socket.on('new_notification', (notification) => {
      addNotification(notification)
    })

    socket.on('disconnect', () => console.log('Socket disconnected'))

    return () => {
      socket?.disconnect()
      initialized.current = false
    }
  }, [token])

  return socket
}

export const getSocket = () => socket