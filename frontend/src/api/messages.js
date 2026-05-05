import api from './axios'

export const getConversations    = ()             => api.get('/messages')
export const getConversation     = (id)           => api.get(`/messages/${id}`)
export const sendMessage         = (id, body)     => api.post(`/messages/${id}`, { body })
export const startConversation   = (userId)       => api.post('/messages/start', { user_id: userId })
