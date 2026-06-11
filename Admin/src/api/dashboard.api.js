import { get } from './client';

export const getDashboardStats = () => get('/analytics/dashboard');
