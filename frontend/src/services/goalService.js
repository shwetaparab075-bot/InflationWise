import API from './api';

export const fetchGoals = async (inflationRate = 6.0) => {
  const response = await API.get(`/goals?inflationRate=${inflationRate}`);
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await API.post('/goals', goalData);
  return response.data;
};

export const updateGoal = async (id, goalData) => {
  const response = await API.put(`/goals/${id}`, goalData);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await API.delete(`/goals/${id}`);
  return response.data;
};
