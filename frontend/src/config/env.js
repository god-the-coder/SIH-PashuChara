const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''


/**
 * Runtime API configuration exposed by Vite.
 */
export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, '')
