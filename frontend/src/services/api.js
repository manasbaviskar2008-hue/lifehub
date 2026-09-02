import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    try {
      const userStr = localStorage.getItem("lifehub_user");

      if (userStr) {
        const user = JSON.parse(userStr);

        if (user?.email) {
          config.headers["X-User-Email"] = user.email
            .toLowerCase()
            .trim();
        }
      }
    } catch (error) {
      console.warn("Could not read logged-in user:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;