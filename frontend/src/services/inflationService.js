import API from './api';

export const fetchInflationRates = async () => {
  const response = await API.get('/inflation/rates');
  return response.data;
};

export const calculateFutureProjection = async (params) => {
  const response = await API.post('/inflation/calculate', params);
  return response.data;
};
