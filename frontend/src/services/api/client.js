import axios from 'axios'
import { API_BASE_URL } from '../../config/env'
import { toApiRequestError } from './error'

/**
 * The single HTTP client for PashuiChara.
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

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toApiRequestError(error)),
)

export default apiClient
