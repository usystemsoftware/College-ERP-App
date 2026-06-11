import { get, post, put, del } from './client';

export const getAdmissions = (params) => get('/admission/applications', { params });
export const getAdmission = (id) => get(`/admission/applications/${id}`);
export const applyAdmission = (data) => post('/admission/apply', data);
export const reviewAdmission = (id, data) => put(`/admission/applications/${id}/review`, data);
export const deleteAdmission = (id) => del(`/admission/applications/${id}`);
