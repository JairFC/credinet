import apiClient from './api';

// Servicios específicos para asociados
export const createAssociate = (data) => apiClient.post('/associates', data);
export const updateAssociate = (id, data) => apiClient.put(`/associates/${id}`, data);
export const deleteAssociate = (id) => apiClient.delete(`/associates/${id}`);
export const getAssociateDetails = (id) => apiClient.get(`/associates/${id}`);
export const getAssociateLevels = () => apiClient.get('/associates/levels');
