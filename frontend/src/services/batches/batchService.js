import apiClient from '../api/client'
import { getApiError } from '../api/error'

/**
 * Batch endpoints — batches are auto-created by the backend when an
 * inspection is saved; there is no manual-create endpoint by design.
 */
const batchService = {
  list() {
    return apiClient.get('/api/batches/')
  },

  getBatch(batchId) {
    return apiClient.get(`/api/batches/${batchId}/`)
  },

  updateBatch(batchId, { batchLabel, quantityKg }) {
    const payload = {}
    if (batchLabel !== undefined) payload.batch_label = batchLabel
    if (quantityKg !== undefined) payload.quantity_kg = quantityKg
    return apiClient.patch(`/api/batches/${batchId}/`, payload)
  },

  getTrend(batchId) {
    return apiClient.get(`/api/batches/${batchId}/trend/`)
  },

  async getQrObjectUrl(batchId) {
    const blob = await apiClient.get(`/api/batches/${batchId}/qr/`, { responseType: 'blob' })
    return URL.createObjectURL(blob)
  },

  async resolveByCode(batchCode) {
    try {
      return await apiClient.get(`/api/batches/by-code/${encodeURIComponent(batchCode)}/`)
    } catch (error) {
      const apiError = getApiError(error)
      if (apiError.status === 404) return null
      throw apiError
    }
  },
}

export default batchService
