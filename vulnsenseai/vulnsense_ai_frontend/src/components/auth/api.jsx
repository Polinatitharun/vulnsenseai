import axios from 'axios';
import Cookies from 'universal-cookie';
import { showToast } from '../common/Toast'; 

const cookies = new Cookies();
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getTokens = () => ({
  access: cookies.get('access_token') || null,
  refresh: cookies.get('refresh_token') || null,
});

export const setTokens = ({ access, refresh }) => {
  const options = { path: '/' };
  if (access) cookies.set('access_token', access, options);
  if (refresh) cookies.set('refresh_token', refresh, options);
};

export const clearTokens = () => {
  cookies.remove('access_token', { path: '/' });
  cookies.remove('refresh_token', { path: '/' });
  cookies.remove('vs_user', { path: '/' });
};

api.interceptors.request.use((config) => {
  const access = cookies.get('access_token');
  if (access) config.headers['Authorization'] = `Bearer ${access}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      showToast(response.data.message, response.data.success ? 'success' : 'error');
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      showToast('Network error or server not responding', 'error');
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = cookies.get('refresh_token');

      if (!refreshToken) {
        clearTokens();
        showToast('Session expired. Please login again.', 'error');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken })
          .then(({ data }) => {
            const newAccess = data.access || data.token;
            if (!newAccess) throw new Error('No access token in refresh response');

            setTokens({ access: newAccess });
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
            processQueue(null, newAccess);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            clearTokens();
            showToast('Session expired. Please login again.', 'error');
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    const errMsg = error.response?.data?.message || error.response?.data?.errors || 'Something went wrong';
    if (Array.isArray(errMsg)) {
      errMsg.forEach((msg) => showToast(msg, 'error'));
    } else if (typeof errMsg === 'object') {
      Object.values(errMsg).forEach((msg) => {
        if (Array.isArray(msg)) msg.forEach((m) => showToast(m, 'error'));
        else showToast(msg, 'error');
      });
    } else {
      showToast(errMsg, 'error');
    }

    return Promise.reject(error);
  }
);

export const get = (url, config = {}) => api.get(url, config).then(r => r.data);
export const post = (url, data, config = {}) => api.post(url, data, config).then(r => r.data);
export const put = (url, data, config = {}) => api.put(url, data, config).then(r => r.data);
export const del = (url, config = {}) => api.delete(url, config).then(r => r.data);

export const loginUser = async (email, password) => {
  const payload = { username: email, password };
  const res = await post('/auth/login/', payload);

  if (!res) throw new Error('Invalid login response');

  setTokens({ access: res.access, refresh: res.refresh });
  if (res.user) cookies.set('vs_user', JSON.stringify(res.user), { path: '/' });

  if (res.message) showToast(res.message, 'success');
  return res;
};

export default api;
