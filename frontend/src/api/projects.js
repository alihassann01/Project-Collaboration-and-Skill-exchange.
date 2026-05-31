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
export const updateMeetingLink = (appId, meeting_link) => api.patch(`/applications/${appId}/meeting`, { meeting_link })
export const deliverProject = (id, file) => {
  const form = new FormData()
  form.append('delivery_file', file)
  return api.post(`/projects/${id}/deliver`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const downloadDelivery = (id) => api.get(`/projects/${id}/delivery/download`, { responseType: 'blob' })
export const startProjectReview = (id) => api.patch(`/projects/${id}/reviewing`)
export const decideProjectDelivery = (id, decision, note = '') => api.patch(`/projects/${id}/delivery-decision`, { decision, note })
export const savePaymentDetails = (id, data) => api.put(`/projects/${id}/payment-details`, data)
export const submitProjectPayment = (id, data) => {
  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value)
  })
  return api.post(`/projects/${id}/payments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const downloadPaymentReceipt = (projectId, paymentId) => api.get(`/projects/${projectId}/payments/${paymentId}/receipt`, { responseType: 'blob' })
export const confirmProjectPayment = (projectId, paymentId) => api.patch(`/projects/${projectId}/payments/${paymentId}/confirm`)
export const disputeProjectPayment = (projectId, paymentId, note = '') => api.patch(`/projects/${projectId}/payments/${paymentId}/dispute`, { note })
