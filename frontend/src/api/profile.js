import api from './axios'

export const getProfile        = ()      => api.get('/profile')
export const getPublicProfile  = (id)    => api.get(`/profile/${id}`)
export const updateProfile     = (data)  => api.patch('/profile', data)
