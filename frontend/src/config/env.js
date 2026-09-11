const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'


/**
 * Runtime API configuration exposed by Vite.
 */
export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, '')
