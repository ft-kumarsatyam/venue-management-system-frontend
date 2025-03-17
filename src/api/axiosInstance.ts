import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);

export const getHeaders = (isMultipart = false) => ({
  "Api-Version": "v1",
  "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
  Accept: "application/json",
});

const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers: getHeaders(),
});

axiosInstance.interceptors.request.use(
  async (config) => {
    
    const token = localStorage.getItem(
      process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME || "cluster_management_token"
    );

    if (config.data instanceof FormData) {
      if (config.headers) {
        config.headers.delete("Content-Type");

        config.headers.set("Api-Version", "v1");
        config.headers.set("Accept", "application/json");
      }
    }

    if (token) {
      config.params = {
        ...config.params,
        auth: token,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(
          process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME ||
            "venue_management_refresh_token"
        );
      } catch (refreshError) {
        console.error("Failed to refresh authentication token", refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
