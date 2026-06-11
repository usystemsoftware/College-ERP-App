import { get, put, patch, del } from './client';

export const getNotifications = (params) => get('/notifications/my', { params });
export const markNotificationRead = (id) => patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => patch('/notifications/mark-all-read');
export const deleteNotification = (id) => del(`/notifications/${id}`);
export const clearAllNotifications = () => del('/notifications/clear-all');
