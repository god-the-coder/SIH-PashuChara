import axios from 'axios'
import { API_BASE_URL } from '../../config/env'
import { toApiRequestError } from './error'

const CSRF_COOKIE_NAME = 'csrftoken'
const CSRF_HEADER_NAME = 'X-CSRFToken'
const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace'])

/**
 * The single HTTP client for PashuChara-AI.
 *
 * Feature services import this instance rather than creating their own Axios
 * clients. Authentication-specific request handling belongs in the
 * interceptor below once authentication is introduced.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Django's session auth only enforces CSRF once a request carries an
 * authenticated session (see backend apps.accounts.views), so the cookie is
 * only guaranteed to exist after login/me — this attaches it whenever present.
 */
apiClient.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toLowerCase()
    if (!CSRF_SAFE_METHODS.has(method)) {
      const token = readCookie(CSRF_COOKIE_NAME)
      if (token) {
        config.headers[CSRF_HEADER_NAME] = token
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toApiRequestError(error)),
)

export default apiClient
