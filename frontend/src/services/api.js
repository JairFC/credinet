import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Usamos la ruta relativa que el proxy de Vite manejará
});

// Interceptor para añadir el token de autenticación a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

// Funciones específicas de la API
export const login = (credentials) => apiClient.post('/auth/login', credentials);

export const getUsers = (page = 1, limit = 10, role = null) => {
  let url = `/auth/users?page=${page}&limit=${limit}`;
  if (role) {
    url += `&role=${role}`;
  }
  return apiClient.get(url);
};

export const getAssociates = (page = 1, limit = 10) => apiClient.get(`/associates/?page=${page}&limit=${limit}`);
export const getLoans = (page = 1, limit = 10) => apiClient.get(`/loans/?page=${page}&limit=${limit}`);
export const getLoanById = (id) => apiClient.get(`/loans/${id}`);
export const getGlobalSummary = () => apiClient.get('/loans/summary');
export const getAssociateDashboard = () => apiClient.get('/associates/dashboard');
export const getClientDashboard = () => apiClient.get('/auth/me/dashboard');