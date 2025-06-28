import axios from "axios";

export const projectHubService = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_HUB_SERVICE,
  withCredentials: true,
});
