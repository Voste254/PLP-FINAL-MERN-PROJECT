import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string; role: 'patient' | 'doctor' }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string; role: 'patient' | 'doctor' }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  create: (data: { doctorId: string; date: string; time: string; reason: string }) =>
    api.post('/appointments', data),
  updateStatus: (id: string, status: 'approved' | 'rejected') =>
    api.put(`/appointments/${id}/status`, { status }),
  getPatientAppointments: () => api.get('/appointments/patient'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
};

export default api;