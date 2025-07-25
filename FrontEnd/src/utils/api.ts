// src/utils/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const ensureValidToken = async (): Promise<boolean> => {
  const token   = localStorage.getItem('token');
  const refresh = localStorage.getItem('refreshToken');

  if (!token) return false;

  try {
    await api.post('/token/verify/', { token });
    return true;
  } catch {
    if (!refresh) {
      localStorage.clear();
      return false;
    }
    try {
      const { data } = await api.post('/token/refresh/', { refresh });
      localStorage.setItem('token', data.access);
      return true;
    } catch {
      localStorage.clear();
      return false;
    }
  }
};