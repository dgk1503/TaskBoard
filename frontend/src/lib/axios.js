import axios from "axios";

// in production, there's no localhost so we have to make this dynamic
// Point to backend API in development (backend default port is 5001)
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getNotes = () => api.get("/notes");
export const createNotes = (note) => api.post("/notes", note);
export const updateNotes = (id, note) => api.put(`/notes/${id}`, note);
export const deleteNotes = (id) => api.delete(`/notes/${id}`);

export default api;
