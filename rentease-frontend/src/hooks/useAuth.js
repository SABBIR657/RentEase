import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  return useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.token)
      toast.success(`Welcome back, ${data.data.user.name}!`)
      const role = data.data.user.role
      if (role === 'admin')  navigate('/admin')
      else if (role === 'owner') navigate('/owner')
      else navigate('/dashboard')
    },


    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: () => {
      toast.success('Account created! Please verify')
      navigate('/login')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const navigate   = useNavigate()
  return () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }
}