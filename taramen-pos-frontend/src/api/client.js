import axios from "axios";
import { config } from "@/config";

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 30000,
});

apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    req.headers.set('Authorization', `Bearer ${token}`);
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    const requestConfig = error?.config ?? {};
    const method = String(requestConfig?.method ?? "get").toLowerCase();
    const isGetLike = ["get", "head", "options"].includes(method);
    const hasNoResponse = !response;
    const isServiceUnavailable = response?.status === 503;
    const isTimeout = error?.code === "ECONNABORTED";
    const retryCount = requestConfig.__retryCount ?? 0;

    // Render/free-tier APIs can cold-start slowly. Retry idempotent requests once.
    if ((hasNoResponse || isServiceUnavailable || isTimeout) && isGetLike && retryCount < 1) {
      requestConfig.__retryCount = retryCount + 1;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return apiClient(requestConfig);
    }

    if (response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
