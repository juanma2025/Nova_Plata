const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Public auth endpoints must never send Authorization headers
  const isPublicAuthEndpoint =
    endpoint.startsWith('/auth/login') ||
    endpoint.startsWith('/auth/register') ||
    endpoint.startsWith('/auth/forgot-password') ||
    endpoint.startsWith('/auth/reset-password');

  let token = localStorage.getItem('access_token');

  // Guard against bloated or corrupted tokens that cause HTTP 431
  if (token && token.length > 4096) {
    console.warn('Token en localStorage supera el tamaño seguro (>4KB). Limpiando...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('mi-plata-auth');
    token = null;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((!isPublicAuthEndpoint && token) ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 431) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('mi-plata-auth');
    throw new Error('Cabeceras de solicitud demasiado grandes (431). Se han limpiado las credenciales antiguas. Intenta de nuevo.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || data?.message || `Error del servidor (${response.status})`);
  }

  return data;
}

export const authService = {
  get: (endpoint: string, options: RequestInit = {}) => fetchWithAuth(endpoint, options),
  post: (endpoint: string, body: any, options: RequestInit = {}) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  patch: (endpoint: string, body: any, options: RequestInit = {}) => fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: (endpoint: string, options: RequestInit = {}) => fetchWithAuth(endpoint, { method: 'DELETE', ...options }),
};
