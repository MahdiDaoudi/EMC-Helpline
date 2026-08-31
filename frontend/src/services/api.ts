import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const isTrackingEndpoint = config.url?.includes("/victims/tracking");
  const isStaffEndpoint =
    config.url?.includes("/profile") ||
    config.url?.includes("/auth") ||
    config.url?.includes("/users") ||
    config.url?.includes("/roles") ||
    config.url?.includes("/organizations") ||
    config.url?.includes("/dashboard") ||
    config.url?.includes("/analytics") ||
    config.url?.includes("/assigned-tos") ||
    config.url?.includes("/validates");

  let token: string | null = null;
  if (isTrackingEndpoint) {
    token = localStorage.getItem("victim_token");
  } else if (isStaffEndpoint) {
    token = localStorage.getItem("emc_token");
  } else {
    // For metadata & shared endpoints
    const isTrackingPath = window.location.pathname.startsWith("/suivi");
    token = isTrackingPath
      ? (localStorage.getItem("victim_token") || localStorage.getItem("emc_token"))
      : (localStorage.getItem("emc_token") || localStorage.getItem("victim_token"));
  }

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
      const isMetadataRequest =
        error.config?.url?.includes("/cyberviolences") ||
        error.config?.url?.includes("/platforms");

      const isLoginRequest =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/victims/tracking/access") ||
        isMetadataRequest;

      if (!isLoginRequest) {
        const isTrackingPath = window.location.pathname.startsWith("/suivi");
        if (isTrackingPath) {
          localStorage.removeItem("victim_token");
          localStorage.removeItem("victim_ref");
          if (window.location.pathname !== "/suivi") {
            window.location.href = "/suivi";
          }
        } else {
          localStorage.removeItem("emc_token");
          localStorage.removeItem("emc_auth_user");

          if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signalement")) {
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  },
);
