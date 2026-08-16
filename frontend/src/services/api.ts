import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("emc_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isFormDataRequest =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormDataRequest && config.headers) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else if (config.headers && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");

      if (!isLoginRequest) {
        localStorage.removeItem("emc_token");
        localStorage.removeItem("emc_auth_user");

        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);
