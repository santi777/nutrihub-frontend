import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// --- Dietitians ---
export const getDietitians = (params) => api.get('/dietitians', { params });
export const getDietitian = (id) => api.get(`/dietitians/${id}`);
export const createDietitian = (data) => api.post('/dietitians', data);

// --- Patients ---
export const getPatients = (params) => api.get('/patients', { params });
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients', data);
export const updatePatientProfile = (id, data) => api.patch(`/patients/${id}/profile`, data);

// --- Packages ---
export const getPackages = (params) => api.get('/dietitian-packages', { params });
export const getPackage = (id) => api.get(`/dietitian-packages/${id}`);
export const createPackage = (data) => api.post('/dietitian-packages', data);

// --- Enrollments ---
export const requestEnrollment = (data) => api.post('/enrollments/request', data);
export const getEnrollmentRequests = (params) => api.get('/enrollments/requests', { params });
export const approveEnrollmentRequest = (id) => api.patch(`/enrollments/${id}/approve`);
export const declineEnrollmentRequest = (id) => api.patch(`/enrollments/${id}/decline`);
export const getActiveEnrollment = (patientId) =>
  api.get('/enrollments/active', { params: { patientId } });
export const getEnrollmentHistory = (patientId) =>
  api.get('/enrollments/history', { params: { patientId } });

// --- Meal Plans ---
export const getMealPlan = (patientId) => api.get('/meal-plans', { params: { patientId } });
export const createOrReplaceMealPlan = (data) => api.post('/meal-plans', data);
export const deleteMealPlan = (id) => api.delete(`/meal-plans/${id}`);

// --- Meal Plan Documents ---
export const uploadMealPlanPdf = (mealPlanId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/meal-plans/${mealPlanId}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const downloadMealPlanPdf = (mealPlanId) =>
  api.get(`/meal-plans/${mealPlanId}/document`, { responseType: 'blob' });
export const deleteMealPlanPdf = (mealPlanId) =>
  api.delete(`/meal-plans/${mealPlanId}/document`);

// --- Health Records ---
export const getHealthRecords = (patientId) => api.get('/health-records', { params: { patientId } });
export const createHealthRecord = (data) => api.post('/health-records', data);

// --- Meal Logs ---
export const getMealLogs = (patientId) => api.get('/meal-logs', { params: { patientId } });
export const createMealLog = (data) => api.post('/meal-logs', data);

export default api;
