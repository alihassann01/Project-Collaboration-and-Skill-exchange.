import api from './axios'

export const getAdminDashboard  = ()   => api.get('/admin')
export const getAdminUsers      = ()   => api.get('/admin/users')
export const toggleUser         = (id) => api.patch(`/admin/users/${id}/toggle`)
export const deleteUser         = (id) => api.delete(`/admin/users/${id}`)
export const getAdminProjects   = ()   => api.get('/admin/projects')
export const closeProject       = (id) => api.patch(`/admin/projects/${id}/close`)
export const deleteAdminProject = (id) => api.delete(`/admin/projects/${id}`)
