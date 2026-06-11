import { get, post, put, del } from './client';

export const getSubjects = () => get('/subjects');
export const createSubject = (data) => post('/subjects', data);
export const updateSubject = (id, data) => put(`/subjects/${id}`, data);
export const deleteSubject = (id) => del(`/subjects/${id}`);
