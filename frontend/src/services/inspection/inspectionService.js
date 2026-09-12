import apiClient from '../api/client'

/**
 * Inspection endpoints — session creation, image capture, the AI follow-up
 * pipeline, and save. Methods are added phase by phase as the frontend wires
 * each part of the flow (see INTEGRATION_PLAN.md).
 */
const inspectionService = {
  list() {
    return apiClient.get('/api/inspections/');
  },

  get(inspectionId) {
    return apiClient.get(`/api/inspections/${inspectionId}/`);
  },

  create({ inspectionType, materialType, materialTypeOther = '', storageDurationDays, batchId }) {
    const payload = {
      inspection_type: inspectionType,
      material_type: materialType,
      material_type_other: materialTypeOther,
      storage_duration_days: storageDurationDays,
    };
    if (batchId != null) payload.batch_id = batchId;
    return apiClient.post('/api/inspections/', payload);
  },

  uploadImage(inspectionId, file, imageType) {
    const formData = new FormData();
    formData.append('image', file);
    if (imageType) formData.append('image_type', imageType);
    return apiClient.post(`/api/inspections/${inspectionId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage(inspectionId, imageId) {
    return apiClient.delete(`/api/inspections/${inspectionId}/images/${imageId}/`);
  },

  generateQuestions(inspectionId) {
    return apiClient.post(`/api/inspections/${inspectionId}/questions/`);
  },

  submitAnswers(inspectionId, answers) {
    return apiClient.post(`/api/inspections/${inspectionId}/questions/answer/`, { answers });
  },

  updateContext(inspectionId, { latitude, longitude, storageDurationDays, storageCondition, moistureExposure, farmerObservation }) {
    const payload = {};
    if (latitude != null && longitude != null) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }
    if (storageDurationDays !== undefined) payload.storage_duration_days = storageDurationDays;
    if (storageCondition !== undefined) payload.storage_condition = storageCondition;
    if (moistureExposure !== undefined) payload.moisture_exposure = moistureExposure;
    if (farmerObservation !== undefined) payload.farmer_observation = farmerObservation;
    return apiClient.patch(`/api/inspections/${inspectionId}/context/`, payload);
  },

  analyze(inspectionId) {
    return apiClient.post(`/api/inspections/${inspectionId}/analyze/`);
  },

  save(inspectionId) {
    return apiClient.post(`/api/inspections/${inspectionId}/save/`);
  },
};

export default inspectionService;
