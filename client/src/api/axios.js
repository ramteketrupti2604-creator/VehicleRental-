import axios from 'axios';

const API = axios.create({ 
  baseURL: `${import.meta.env.VITE_API_URL}/api` 
});

API.interceptors.request.use((req) => {
  let token = localStorage.getItem('token');
  if (!token) {
    const info = localStorage.getItem('userInfo');
    if (info) {
      try { token = JSON.parse(info).token; } catch {}
    }
  }
  if (token) {
    token = token.replace(/"/g, '').trim();
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;