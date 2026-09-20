// Axios service wrapper for REST backend integration
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your backend API base URL
});

// Intercept requests to attach JWT Authorization header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (credentials) => API.post('/auth/login/', credentials);
export const registerUser = (data) => API.post('/auth/register/', data);
export const fetchTickets = () => API.get('/tickets/');
export const createTicket = (ticketData) => API.post('/tickets/', ticketData);
export const fetchTicketDetails = (ticketId) => API.get(`/tickets/${ticketId}/`);
export const updateTicketStatus = (ticketId, status) => API.patch(`/tickets/${ticketId}/`, { status });

export default API;