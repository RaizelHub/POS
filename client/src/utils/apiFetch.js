export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export default apiFetch;
