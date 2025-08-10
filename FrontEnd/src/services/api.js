
const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json', // Explicitly ask for JSON
    },
  });

  // First check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    throw new Error(errorData.detail || JSON.stringify(errorData));
  }

  return response.json();
};



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