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

  sendOtp({ phoneNumber }) {
    return apiClient.post('/api/accounts/otp/send/', {
      phone_number: phoneNumber,
    })
  },

  verifyOtp({ phoneNumber, otp, fullName }) {
    return apiClient.post('/api/accounts/otp/verify/', {
      phone_number: phoneNumber,
      otp,
      full_name: fullName,
    })
  },

  googleLogin({ email, googleId, fullName, avatarUrl }) {
    return apiClient.post('/api/accounts/google/', {
      email,
      google_id: googleId,
      full_name: fullName,
      avatar_url: avatarUrl,
    })
  },

  logout() {
    return apiClient.post('/api/accounts/logout/')
  },

  me() {
    return apiClient.get('/api/accounts/me/')
  },

  updateProfile({ fullName, email, age, gender, avatarFile }) {
    if (avatarFile) {
      const formData = new FormData()
      if (fullName !== undefined) formData.append('full_name', fullName)
      if (email !== undefined) formData.append('email', email)
      if (age !== undefined && age !== null) formData.append('age', age)
      if (gender !== undefined) formData.append('gender', gender)
      formData.append('avatar', avatarFile)
      return apiClient.patch('/api/accounts/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    const payload = {}
    if (fullName !== undefined) payload.full_name = fullName
    if (email !== undefined) payload.email = email
    if (age !== undefined) payload.age = age
    if (gender !== undefined) payload.gender = gender
    return apiClient.patch('/api/accounts/me/', payload)
  },

  deleteAccount() {
    return apiClient.delete('/api/accounts/me/')
  },
}

export default authService
