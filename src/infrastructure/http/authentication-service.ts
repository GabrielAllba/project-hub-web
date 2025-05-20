import axios from "axios";

export const authenticationService = axios.create({
  baseURL: "http://localhost:3000/api", 
  withCredentials: true,
});
