import { get, put } from './client';

export const getMyProfile = () => get('/auth/me');
export const updateProfile = (id, data) => put(`/users/${id}`, data);
