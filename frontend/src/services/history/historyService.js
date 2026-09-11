import apiClient from '../api/client'

/**
 * Inspection history — only SAVED inspections count as a farmer's real record.
 */
const historyService = {
  listSaved() {
    return apiClient.get('/api/inspections/', { params: { status: 'SAVED' } })
  },

  getResult(inspectionId) {
    return apiClient.get(`/api/results/${inspectionId}/`)
  },
}

export default historyService
