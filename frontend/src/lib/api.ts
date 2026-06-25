import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
});

export const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("essentia_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
      localStorage.removeItem("essentia_token");
      localStorage.removeItem("essentia_therapist");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("essentia_portal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/portal/auth/login")) {
      localStorage.removeItem("essentia_portal_token");
      localStorage.removeItem("essentia_portal_account");
      window.location.href = "/portal/login";
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.message || "Não foi possível concluir a ação.";
  return "Ocorreu um erro inesperado.";
}
