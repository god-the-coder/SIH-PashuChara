/**
 * Environment configuration for PashuChara-AI frontend.
 * Reads environment variables exposed by Vite with fallback values.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
