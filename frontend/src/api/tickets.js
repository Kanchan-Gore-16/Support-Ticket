import api from "./client";

export const fetchTickets = async ({ page, limit, status, priority, search }) => {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (search) params.set("search", search);

  const res = await api.get(`/tickets?${params.toString()}`);
  return res.data;
};

export const fetchTicket = async (id) => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

export const fetchNotes = async (id) => {
  const res = await api.get(`/tickets/${id}/notes`);
  return res.data;
};

export const updateTicket = async ({ id, status, priority }) => {
  const res = await api.patch(`/tickets/${id}`, { status, priority });
  return res.data;
};

export const addNote = async ({ id, text }) => {
  const res = await api.post(`/tickets/${id}/notes`, { text });
  return res.data;
};
