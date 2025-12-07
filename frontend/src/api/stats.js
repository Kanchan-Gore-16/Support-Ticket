// src/api/stats.js
import api from "./client";

export const fetchStats = async () => {
  const res = await api.get("/stats");
  return res.data; 
};
