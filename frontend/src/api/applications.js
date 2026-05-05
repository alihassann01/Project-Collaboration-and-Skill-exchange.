import api from './axios'

export const getMyApplications   = ()   => api.get('/my-applications')
export const withdrawApplication = (id) => api.patch(`/applications/${id}/withdraw`)
