import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles';

const getToken = () => JSON.parse(localStorage.getItem('userInfo'))?.token;

const config = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getVehicles = async (params = {}) => {
  const { data } = await axios.get(API_URL, { params });
  return data;
};

export const getVehicleById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createVehicle = async (vehicleData) => {
  const { data } = await axios.post(API_URL, vehicleData, config());
  return data;
};

export const updateVehicle = async (id, vehicleData) => {
  const { data } = await axios.put(`${API_URL}/${id}`, vehicleData, config());
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, config());
  return data;
};

export const updateVehicleStatus = async (id, status) => {
  const { data } = await axios.put(`${API_URL}/${id}/status`, { status }, config());
  return data;
};