import apiClient from '../api/client'
import { getApiError } from '../api/error'

/**
 * Farm endpoints — one farm per farmer, at /api/farms/me/.
 */
const farmService = {
  async getMyFarm() {
    try {
      return await apiClient.get('/api/farms/me/')
    } catch (error) {
      const apiError = getApiError(error)
      // No farm registered yet is a normal state, not a failure.
      if (apiError.status === 404) return null
      throw apiError
    }
  },

  createFarm({ farmName, location, totalCattle }) {
    return apiClient.post('/api/farms/me/', {
      farm_name: farmName,
      location,
      total_cattle: totalCattle,
    })
  },

  updateFarm({ farmName, location, totalCattle }) {
    const payload = {}
    if (farmName !== undefined) payload.farm_name = farmName
    if (location !== undefined) payload.location = location
    if (totalCattle !== undefined) payload.total_cattle = totalCattle
    return apiClient.patch('/api/farms/me/', payload)
  },

  getCurrentWeather(latitude, longitude) {
    return apiClient.get('/api/farms/weather/', { params: { lat: latitude, lon: longitude } })
  },

  listCattleGroups() {
    return apiClient.get('/api/farms/cattle/')
  },

  createCattleGroup({ category, breed, count, milkLitersPerDay, lactationStage }) {
    return apiClient.post('/api/farms/cattle/', {
      category,
      breed,
      count,
      milk_liters_per_day: milkLitersPerDay,
      lactation_stage: lactationStage,
    })
  },

  deleteCattleGroup(groupId) {
    return apiClient.delete(`/api/farms/cattle/${groupId}/`)
  },
}

export default farmService
