import axios from "axios";

export const projectHubService = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});
