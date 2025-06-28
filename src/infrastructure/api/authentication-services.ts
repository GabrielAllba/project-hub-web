import axios from "axios";

export const authenticationServices = axios.create({
  baseURL: import.meta.env.VITE_AUTHENTICATION_SERVICE,
  withCredentials: true,
});
