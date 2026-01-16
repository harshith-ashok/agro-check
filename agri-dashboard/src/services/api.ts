import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface User {
  id: number;
  identity_code: string;
  email?: string;
  name?: string;
  created_at: string;
  last_login?: string;
}

export interface SensorReading {
  soil_moisture: number;
  soil_ph: number;
  air_temp: number;
  humidity: number;
  battery: number;
  timestamp: string;
}

export interface System {
  id: number;
  user_id: number;
  device_id: string;
  name: string;
  region: string;
  latitude?: number;
  longitude?: number;
  farm_size?: number;
  crop_type?: string;
  soil_type?: string;
  installation_date?: string;
  notes?: string;
  status: "online" | "warning" | "offline";
  soil_moisture?: number;
  soil_ph?: number;
  air_temp?: number;
  humidity?: number;
  battery?: number;
  timestamp?: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  register: async (data: { email?: string; name?: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (identity_code: string): Promise<User> => {
    const response = await api.post("/auth/login", { identity_code });
    return response.data;
  },

  verify: async (identity_code: string) => {
    const response = await api.post("/auth/verify", { identity_code });
    return response.data;
  },
};

// Systems API
export const systemsAPI = {
  getUserSystems: async (user_id: number): Promise<System[]> => {
    const response = await api.get(`/systems/user/${user_id}`);
    return response.data;
  },

  getSystem: async (id: number): Promise<System> => {
    const response = await api.get(`/systems/${id}`);
    return response.data;
  },

  createSystem: async (data: {
    user_id: number;
    device_id: string;
    name: string;
    region: string;
    latitude?: number;
    longitude?: number;
    farm_size?: number;
    crop_type?: string;
    soil_type?: string;
    installation_date?: string;
    notes?: string;
  }) => {
    const response = await api.post("/systems", data);
    return response.data;
  },

  updateSystem: async (
    id: number,
    data: Partial<Omit<System, "id" | "user_id" | "created_at" | "updated_at">>
  ) => {
    const response = await api.put(`/systems/${id}`, data);
    return response.data;
  },

  deleteSystem: async (id: number) => {
    const response = await api.delete(`/systems/${id}`);
    return response.data;
  },

  getHistory: async (
    id: number,
    limit = 100,
    days = 7
  ): Promise<SensorReading[]> => {
    const response = await api.get(`/systems/${id}/history`, {
      params: { limit, days },
    });
    return response.data;
  },
};

// Sensors API
export const sensorsAPI = {
  fetchSensorData: async (device_id: string) => {
    const response = await api.get(`/sensors/fetch/${device_id}`);
    return response.data;
  },

  fetchAllSensorData: async (user_id: number) => {
    const response = await api.post("/sensors/fetch-all", { user_id });
    return response.data;
  },

  manualDataEntry: async (
    device_id: string,
    data: {
      soil_moisture: number;
      soil_ph: number;
      air_temp: number;
      humidity: number;
      battery: number;
    }
  ) => {
    const response = await api.post(`/sensors/manual/${device_id}`, data);
    return response.data;
  },
};

export default api;
