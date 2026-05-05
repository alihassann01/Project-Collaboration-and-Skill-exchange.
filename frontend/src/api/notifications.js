import api from './axios'

export const getNotifications  = ()   => api.get('/notifications')
export const markOneRead       = (id) => api.post(`/notifications/${id}/read`)
export const markAllRead       = ()   => api.post('/notifications/mark-all-read')
