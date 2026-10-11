const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

/**
 * Enhanced fetch wrapper with JWT attachment and standardized error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('handloom_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If uploading FormData, delete Content-Type so browser can set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Expired or invalid token: clean storage if not on public routes
        const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
        if (!isAuthRoute && localStorage.getItem('handloom_token')) {
          localStorage.removeItem('handloom_token');
          localStorage.removeItem('handloom_user');
          window.dispatchEvent(new Event('auth_token_expired'));
        }
      }

      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData) =>
    request(endpoint, {
      method: 'POST',
      body: formData,
    }),
  getBaseUrl: () => API_BASE_URL,
};
