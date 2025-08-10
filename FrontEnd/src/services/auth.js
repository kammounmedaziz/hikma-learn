// src/services/auth.js
import { fetchWithAuth } from './api';

const API_BASE = 'http://127.0.0.1:8000/api';

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  
  // Get user profile after successful login
  try {
    const user = await fetchWithAuth('/profile/');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    logout();
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};


export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  
  const response = await fetch(`${API_BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });

  if (!response.ok) {
    logout();
    throw new Error('Session expired');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};