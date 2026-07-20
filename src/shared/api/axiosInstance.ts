import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '',
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

export { axiosInstance };
