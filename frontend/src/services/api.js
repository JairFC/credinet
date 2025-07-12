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