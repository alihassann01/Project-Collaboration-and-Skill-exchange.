import api from './axios'

export const getAdminDashboard  = ()           => api.get('/admin')
export const getAdminUsers      = (params = {}) => api.get('/admin/users', { params })
export const toggleUser         = (id)         => api.patch(`/admin/users/${id}/toggle`)
export const deleteUser         = (id)         => api.delete(`/admin/users/${id}`)
export const getAdminProjects   = (params = {}) => api.get('/admin/projects', { params })
export const closeProject       = (id)         => api.patch(`/admin/projects/${id}/close`)
export const reopenProject      = (id)         => api.patch(`/admin/projects/${id}/reopen`)
export const deleteAdminProject = (id)         => api.delete(`/admin/projects/${id}`)
export const getAdminReports    = ()           => api.get('/admin/reports')
