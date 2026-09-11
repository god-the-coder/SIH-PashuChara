import apiClient from '../api/client'

const batchService = {
  resolveByCode(batchCode) {
    return apiClient.get(`/batches/by-code/${encodeURIComponent(batchCode)}/`)
  },
}

export default batchService
