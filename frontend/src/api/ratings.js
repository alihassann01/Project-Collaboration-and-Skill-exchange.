import api from './axios'

export const getUserRatings = (userId) => api.get(`/ratings/${userId}`)
export const submitRating   = (userId, projectId, data) => api.post(`/ratings/${userId}/${projectId}`, data)
