import { get, post, put, del } from './client';

export const getDepartments = () => get('/departments');
export const createDepartment = (data) => post('/departments', data);
export const updateDepartment = (id, data) => put(`/departments/${id}`, data);
export const deleteDepartment = (id) => del(`/departments/${id}`);
