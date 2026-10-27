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

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(
      "Cannot connect to backend server. Make sure your server is running (npm run dev in server/)."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let msg = data.message;
    if (!msg) {
      if (response.status === 403) {
        msg = "Access Forbidden (403). If running on macOS, port 5000 is reserved by AirPlay Receiver. Use port 5001.";
      } else if (response.status === 502 || response.status === 504) {
        msg = "Server unavailable. Please ensure the backend is running on port 5001.";
      } else {
        msg = "Unable to complete request. Please verify server status.";
      }
    }
    throw new Error(msg);
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