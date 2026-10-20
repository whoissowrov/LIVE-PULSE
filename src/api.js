// LifePulse Frontend API Client
const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const savedToken = token || localStorage.getItem('lifepulse_token');
  if (savedToken) {
    headers['Authorization'] = `Bearer ${savedToken}`;
  }
  return headers;
};

export const api = {
  // Health check
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Auth APIs
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // User APIs
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return await res.json();
  },

  updateLocation: async (locationData) => {
    const res = await fetch(`${API_BASE_URL}/users/location`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(locationData)
    });
    return await res.json();
  },

  // Blood donation recording & automated recovery tracking
  recordDonationDate: async (donationData) => {
    const res = await fetch(`${API_BASE_URL}/users/record-donation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(donationData)
    });
    return await res.json();
  },

  // Website Notifications & Messages
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/users/notifications`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await res.json();
  },

  clearNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/users/notifications`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Donor Directory
  getDonors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/donors?${query}`);
    return await res.json();
  },

  // Regional Donor & Login Activity Analytics
  getRegionalStats: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/donors/regional-stats?${query}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Emergency SOS
  getSosRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/sos?${query}`);
    return await res.json();
  },

  createSosRequest: async (sosData) => {
    const res = await fetch(`${API_BASE_URL}/sos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sosData)
    });
    return await res.json();
  },

  updateSosStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/sos/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // Admin APIs (requires admin token)
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getAdminUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  verifyDonor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/verify`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await res.json();
  },

  changeUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    return await res.json();
  },

  toggleUserBan: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/ban`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  getAdminSos: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/sos`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  deleteSos: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/sos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  adminCreateUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  adminUpdateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  adminGetDonations: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/donations`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  adminLogDonation: async (donationData) => {
    const res = await fetch(`${API_BASE_URL}/admin/donations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(donationData)
    });
    return await res.json();
  },

  adminDeleteDonation: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/donations/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  adminUpdateSos: async (id, sosData) => {
    const res = await fetch(`${API_BASE_URL}/admin/sos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sosData)
    });
    return await res.json();
  }
};

export default api;
