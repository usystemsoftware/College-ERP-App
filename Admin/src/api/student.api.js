import { get, post, put, del } from './client';

export const getStudents = () => get('/students');
export const getStudent = (id) => get(`/students/${id}`);
export const createStudent = (data) => post('/students', data);
export const updateStudent = (id, data) => put(`/students/${id}`, data);
export const deleteStudent = (id) => del(`/students/${id}`);
