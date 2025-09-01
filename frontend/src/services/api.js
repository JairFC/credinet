import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Usamos una ruta relativa para que el proxy de Vite funcione
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Funciones de servicio específicas
export const getGlobalSummary = () => apiClient.get('/loans/summary');
export const getAssociateDashboard = () => apiClient.get('/associates/dashboard');
export const getClientDashboard = () => apiClient.get('/auth/me/dashboard');

export const getUsers = (page = 1, limit = 20, role = null, search = '') => {
  const params = new URLSearchParams({ page, limit });
  if (role) {
    params.append('role', role);
  }
  if (search) {
    params.append('search', search);
  }
  return apiClient.get(`/auth/users?${params.toString()}`);
};

export const getUserDetails = (userId) => apiClient.get(`/auth/users/${userId}`);

export const getAssociates = (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) {
    params.append('search', search);
  }
  return apiClient.get(`/associates/?${params.toString()}`);
};

export const getLoans = (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) {
    params.append('search', search);
  }
  return apiClient.get(`/loans/?${params.toString()}`);
};

export default apiClient;