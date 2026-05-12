import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const url = typeof config.url === "string" ? config.url : "";
  if (url.includes("/api/driver/")) {
    const dt = localStorage.getItem("livreur_token");
    if (dt) config.headers.Authorization = `Bearer ${dt}`;
    return config;
  }
  const t = localStorage.getItem("entreprise_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const origin = import.meta.env.VITE_API_URL || "";
  return `${origin}${path}`;
}
