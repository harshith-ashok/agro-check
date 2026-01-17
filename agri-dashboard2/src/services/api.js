import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};

export const systemService = {
  async getAll() {
    const response = await api.get("/systems");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/systems/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/systems", data);
    return response.data;
  },

  async getHistory(systemId, hours = 24) {
    const response = await api.get(`/systems/${systemId}/data?hours=${hours}`);
    return response.data;
  },
};

export default api;
