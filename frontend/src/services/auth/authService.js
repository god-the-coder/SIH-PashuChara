import apiClient from '../api/client'

/**
 * Authentication endpoints — phone number + password, Django session auth.
 *
 * All calls rely on `apiClient`'s `withCredentials` + CSRF interceptor; there
 * is no token to store client-side, the session cookie is the source of truth.
 */
const authService = {
  register({ phoneNumber, fullName, password }) {
    return apiClient.post('/api/accounts/register/', {
      phone_number: phoneNumber,
      full_name: fullName,
      password,
    })
  },

  login({ phoneNumber, password }) {
    return apiClient.post('/api/accounts/login/', {
      phone_number: phoneNumber,
      password,
    })
  },

  logout() {
    return apiClient.post('/api/accounts/logout/')
  },

  me() {
    return apiClient.get('/api/accounts/me/')
  },
}

export default authService
