import axios from 'axios'

export const API_ERROR_CATEGORY = Object.freeze({
  BAD_REQUEST: 'bad-request',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  CONFLICT: 'conflict',
  VALIDATION: 'validation',
  RATE_LIMITED: 'rate-limited',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  UNEXPECTED: 'unexpected',
})

const errorMessages = {
  [API_ERROR_CATEGORY.BAD_REQUEST]: 'The request could not be processed.',
  [API_ERROR_CATEGORY.UNAUTHORIZED]: 'You need to sign in to continue.',
  [API_ERROR_CATEGORY.FORBIDDEN]: 'You do not have permission to perform this action.',
  [API_ERROR_CATEGORY.NOT_FOUND]: 'The requested resource could not be found.',
  [API_ERROR_CATEGORY.CONFLICT]: 'This action conflicts with the current data.',
  [API_ERROR_CATEGORY.VALIDATION]: 'Please review the submitted information.',
  [API_ERROR_CATEGORY.RATE_LIMITED]: 'Too many requests were made. Please try again shortly.',
  [API_ERROR_CATEGORY.SERVER]: 'The service is temporarily unavailable. Please try again.',
  [API_ERROR_CATEGORY.TIMEOUT]: 'The request timed out. Please try again.',
  [API_ERROR_CATEGORY.NETWORK]: 'Unable to reach the service. Check your connection and try again.',
  [API_ERROR_CATEGORY.UNEXPECTED]: 'Something went wrong. Please try again.',
}

function getCategory(status, code, isNetworkError) {
  if (code === 'ECONNABORTED') return API_ERROR_CATEGORY.TIMEOUT
  if (isNetworkError) return API_ERROR_CATEGORY.NETWORK
  if (status === null) return API_ERROR_CATEGORY.UNEXPECTED

  switch (status) {
    case 400:
      return API_ERROR_CATEGORY.BAD_REQUEST
    case 401:
      return API_ERROR_CATEGORY.UNAUTHORIZED
    case 403:
      return API_ERROR_CATEGORY.FORBIDDEN
    case 404:
      return API_ERROR_CATEGORY.NOT_FOUND
    case 409:
      return API_ERROR_CATEGORY.CONFLICT
    case 422:
      return API_ERROR_CATEGORY.VALIDATION
    case 429:
      return API_ERROR_CATEGORY.RATE_LIMITED
    default:
      return status >= 500 ? API_ERROR_CATEGORY.SERVER : API_ERROR_CATEGORY.UNEXPECTED
  }
}

function getBackendMessage(data) {
  if (typeof data === 'string') return data

  if (Array.isArray(data)) {
    return typeof data[0] === 'string' ? data[0] : null
  }

  if (data && typeof data === 'object') {
    const message = data.detail || data.message || data.error
    if (typeof message === 'string') return message
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0]

    // DRF field-level validation errors, e.g. {"answers": ["This field is required."]}
    const firstFieldErrors = Object.values(data)[0]
    if (Array.isArray(firstFieldErrors) && typeof firstFieldErrors[0] === 'string') {
      return firstFieldErrors[0]
    }

    return null
  }

  return null
}

/**
 * A normalized error returned by the shared API client.
 */
export class ApiRequestError extends Error {
  constructor({ message, status, category, code, data }) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.category = category
    this.code = code
    this.data = data
  }
}

/**
 * Converts Axios, network, and unexpected failures into a stable API error.
 * Backend response data is retained for consumers that need field-level detail.
 */
export function toApiRequestError(error) {
  if (error instanceof ApiRequestError) return error

  const isAxiosError = axios.isAxiosError(error)
  const status = isAxiosError ? error.response?.status ?? null : null
  const code = isAxiosError ? error.code ?? null : null
  const data = isAxiosError ? error.response?.data ?? null : null
  const isNetworkError = isAxiosError && !error.response && Boolean(error.request || code === 'ERR_NETWORK')
  const category = isAxiosError
    ? getCategory(status, code, isNetworkError)
    : API_ERROR_CATEGORY.UNEXPECTED
  const message = getBackendMessage(data) || errorMessages[category]

  return new ApiRequestError({ message, status, category, code, data })
}

/**
 * Normalizes errors caught outside the Axios interceptor boundary as well.
 */
export function getApiError(error) {
  return toApiRequestError(error)
}
