import api from './axios'

export const getProjects     = (params)        => api.get('/projects', { params })
export const getProject      = (id)            => api.get(`/projects/${id}`)
export const createProject   = (data)          => api.post('/projects', data)
export const updateProject   = (id, data)      => api.put(`/projects/${id}`, data)
export const deleteProject   = (id)            => api.delete(`/projects/${id}`)
export const getMyProjects   = ()              => api.get('/employer/projects')
export const applyToProject  = (id, data)      => api.post(`/projects/${id}/apply`, data)
export const getApplications = (projectId)     => api.get(`/projects/${projectId}/applications`)
export const updateAppStatus = (appId, status) => api.put(`/applications/${appId}/status`, { status })
