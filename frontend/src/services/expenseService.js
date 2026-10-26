import API from './api';

export const fetchExpenses = async () => {
  const response = await API.get('/expenses');
  return response.data;
};

export const saveExpenses = async (expenses) => {
  const response = await API.put('/expenses', { expenses });
  return response.data;
};
