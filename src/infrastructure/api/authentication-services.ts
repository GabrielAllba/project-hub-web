import axios from "axios";

export const authenticationServices = axios.create({
  baseURL: "http://localhost:3000/api", 
  withCredentials: true,
});