import apiClient from '../api/client'

const notificationService = {
  list() {
    return apiClient.get('/api/notifications/')
  },

  unreadCount() {
    return apiClient.get('/api/notifications/unread-count/')
  },

  markRead(notificationId) {
    return apiClient.patch(`/api/notifications/${notificationId}/read/`)
  },

  markAllRead() {
    return apiClient.post('/api/notifications/mark-all-read/')
  },
}

export default notificationService
