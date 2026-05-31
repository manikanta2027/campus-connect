import API_URL from '../config/api';

/**
 * Wrapper for fetch API that automatically prepends the API URL
 * @param {string} endpoint - The API endpoint (e.g., '/posts', '/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  return fetch(url, options);
};

export default apiFetch;
