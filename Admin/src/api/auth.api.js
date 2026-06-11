import { post } from './client';

export const login = (data) => post('/auth/login', data);
