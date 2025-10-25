import axios from 'axios';
import authService from './authService';

// const API_URL = process.env.REACT_APP_API_URL;
const API_URL ="https://api.legalizcasemanagement.site" || process.env.REACT_APP_API_URL || "https:legalizmanagement.site/api";
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => {
  if (error.response?.status === 401) { authService.logout(); window.location.href = '/login'; }
  return Promise.reject(error);
});

// Cases API
const getCases = () => api.get('/cases/read.php');
const getCaseDetails = (id) => api.get(`/cases/read_one.php?id=${id}`);
const createCase = (caseData) => api.post('/cases/create.php', caseData);
const updateCase = (caseData) => api.put('/cases/update.php', caseData);
const deleteCase = (id) => api.post('/cases/delete.php', { id });

// Schedules API
const getSchedules = (startStr, endStr) => api.get(`/schedules/read.php?start=${startStr}&end=${endStr}`);
const createScheduleEvent = (eventData) => api.post('/schedules/create.php', eventData);
const updateScheduleEvent = (eventData) => api.put('/schedules/update.php', eventData);
const deleteScheduleEvent = (id) => api.post('/schedules/delete.php', { id });
const getSchedulesForCase = (case_id) => api.get(`/schedules/read_by_case.php?case_id=${case_id}`);

// Documents API
const getDocumentsForCase = (case_id) => api.get(`/documents/read_by_case.php?case_id=${case_id}`);
const uploadDocument = (formData) => api.post('/documents/upload.php', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
const deleteDocument = (id) => api.post('/documents/delete.php', { id });

// Billing API
const getBillingForCase = (case_id) => api.get(`/billing/read_by_case.php?case_id=${case_id}`);
const updateBillingStatus = (id, status) => api.put('/billing/update_status.php', { id, status });
const createBillingRecord = (billingData) => api.post('/billing/create.php', billingData);

// Clients API
const getClients = () => api.get('/clients/read.php');
const getClientDetails = (id) => api.get(`/clients/read_one.php?id=${id}`);
const createClient = (clientData) => api.post('/clients/create.php', clientData);
const updateClient = (clientData) => api.put('/clients/update.php', clientData);
const deleteClient = (id) => api.post('/clients/delete.php', { id });

// Users API (Admin)
const getUsers = () => api.get('/users/read.php');
const getUserDetails = (id) => api.get(`/users/read_one.php?id=${id}`);
const createUser = (userData) => api.post('/users/create.php', userData);
const updateUser = (userData) => api.put('/users/update.php', userData);
const deleteUser = (id) => api.post('/users/delete.php', { id });
const getLawyers = () => api.get('/users/read_lawyers.php');

// Profile API (Self)
const getMyProfile = () => api.get('/profile/read.php');
const updateMyProfile = (profileData) => api.put('/profile/update.php', profileData);

// Dashboard API
const getDashboardStats = () => getCases();
const getWorkloadData = () => api.get('/dashboard/workload.php');
const getRecentActivity = (limit = 10) => api.get(`/dashboard/activity.php?limit=${limit}`); // <-- Added this

// AI Lookup API
const getAiLookup = (queryText) => api.post('/ai/lookup.php', { query_text: queryText });


const apiService = {
  getCases, getCaseDetails, createCase, updateCase, deleteCase,
  getSchedules, createScheduleEvent, updateScheduleEvent, deleteScheduleEvent, getSchedulesForCase,
  getDocumentsForCase, uploadDocument, deleteDocument,
  getBillingForCase, updateBillingStatus, createBillingRecord,
  getClients, getClientDetails, createClient, updateClient, deleteClient,
  getUsers, getUserDetails, createUser, updateUser, deleteUser,
  getLawyers,
  getMyProfile, updateMyProfile,
  getDashboardStats, getWorkloadData,
  getAiLookup,
  getRecentActivity, // <-- Exported this
};

export default apiService;