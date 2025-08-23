const axios = require('axios');

const PYTHON_API_BASE_URL = process.env.PYTHON_API_BASE_URL || 'http://localhost:8008/api';

const pythonAPI = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
pythonAPI.interceptors.request.use(
  (config) => {
    console.log(`Making request to Python API: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
pythonAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Python API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    const customError = new Error(
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.message || 
      'Python API Error'
    );
    customError.status = error.response?.status || 500;
    customError.originalError = error.response?.data;
    
    return Promise.reject(customError);
  }
);

module.exports = pythonAPI;