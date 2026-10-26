import API from './api';

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('inflationwise_token', response.data.token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('inflationwise_token', response.data.token);
  }
  return response.data;
};

export const getUserProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('inflationwise_token');
};
