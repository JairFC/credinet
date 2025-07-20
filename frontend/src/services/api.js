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

export const getUsers = (page = 1, limit = 10, role = null) => {
  let url = `/auth/users?page=${page}&limit=${limit}`;
  if (role) {
    url += `&role=${role}`;
  }
  return apiClient.get(url);
};


export default apiClient;
