import api from './axios'

export const getListings    = ()              => api.get('/skill-swap')
export const createListing  = (data)          => api.post('/skill-swap', data)
export const sendRequest    = (id)            => api.post(`/skill-swap/${id}/request`)
export const respondRequest = (id, status)    => api.patch(`/skill-swap/requests/${id}/respond`, { status })
export const updateSwapMeeting = (id, meeting_link) => api.patch(`/skill-swap/requests/${id}/meeting`, { meeting_link })
export const toggleListing  = (id)            => api.patch(`/skill-swap/${id}/toggle`)
export const deleteListing  = (id)            => api.delete(`/skill-swap/${id}`)
