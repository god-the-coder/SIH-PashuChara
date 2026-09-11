const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be defined to use the API client.')
}

/**
 * Runtime API configuration exposed by Vite.
 */
export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, '')
