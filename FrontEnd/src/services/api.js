const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_BASE}${url}`, config);

  // First check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired, try to refresh
      try {
        const newToken = await refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE}${url}`, config);
        if (!retryResponse.ok) throw new Error('Authentication failed');
        return await retryResponse.json();
      } catch (error) {
        logout();
        throw error;
      }
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || JSON.stringify(errorData));
  }

  return await response.json();
};

// Dummy refreshToken and logout implementations
async function refreshToken() {
  // Implement your token refresh logic here
  throw new Error('Token refresh not implemented');
}

function logout() {
  localStorage.removeItem('access_token');
  window.location.href = '/auth';
}

export const taskApi = {
  getAll: async (token) => {
    const response = await fetch(`${API_BASE}/workspace/tasks/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  update: async (id, data, token) => {
    const response = await fetch(`${API_BASE}/workspace/tasks/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Add other methods (create, delete, etc)
};

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => response.text());
    throw new Error(typeof error === 'object' ? error.error || error.message : error);
  }
  return response.json();
}