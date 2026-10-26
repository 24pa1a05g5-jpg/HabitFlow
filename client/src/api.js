const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("habitflow_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const registerUser = (userData) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const loginUser = (userData) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const getHabits = () => request("/habits");

export const getStats = () => request("/habits/stats");

export const createHabit = (habitData) =>
  request("/habits", {
    method: "POST",
    body: JSON.stringify(habitData),
  });

export const updateHabit = (id, habitData) =>
  request(`/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(habitData),
  });

export const toggleHabit = (id, date) =>
  request(`/habits/${id}/toggle`, {
    method: "PATCH",
    body: date ? JSON.stringify({ date }) : undefined,
  });

export const deleteHabit = (id) =>
  request(`/habits/${id}`, {
    method: "DELETE",
  });