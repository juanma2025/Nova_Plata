const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || 'Ocurrió un error inesperado');
  }

  return data;
}

export const authService = {
  get: (endpoint: string, options: RequestInit = {}) => fetchWithAuth(endpoint, options),
  post: (endpoint: string, body: any, options: RequestInit = {}) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  patch: (endpoint: string, body: any, options: RequestInit = {}) => fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
};
