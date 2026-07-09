import { useQuery } from '@tanstack/react-query'
import api from '../api/axiosInstance'

export const useProperties = (params = {}) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => api.get('/properties', { params }).then(r => r.data),
  })
}

export const useProperty = (id) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export const useFeaturedProperties = () => {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => api.get('/properties/featured').then(r => r.data),
  })
}

export const useMapProperties = () => {
  return useQuery({
    queryKey: ['properties', 'map'],
    queryFn: () => api.get('/properties/map').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })
}


export const useSearchProperties = (params) => {
  return useQuery({
    queryKey: ['properties', 'search', params],
    queryFn: () => api.get('/properties', { params }).then(r => r.data),
    enabled: true,
    keepPreviousData: true, // keeps old data while fetching new page
  })
}