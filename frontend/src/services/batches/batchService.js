import apiClient from '../api/client'

/**
 * Batch endpoints. Methods are added phase by phase as the frontend wires
 * each part of the flow (see INTEGRATION_PLAN.md).
 */
const batchService = {
  getBatch(batchId) {
    return apiClient.get(`/api/batches/${batchId}/`)
  },
}

export default batchService
