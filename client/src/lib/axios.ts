import axios from "axios";

const baseURL =
  import.meta.env.VITE_BACKEND_URL as string;

console.log("Backend URL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    return Promise.reject(error);
  },
);

export default api;