import API from './api';

export const fetchSavingsPlans = async () => {
  const response = await API.get('/savings');
  return response.data;
};

export const connectBank = async () => {
  const response = await API.post('/savings/connect-bank');
  return response.data;
};
