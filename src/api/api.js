import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials) => {
    console.log('DEBUG: Frontend login attempt:', credentials);
    // backend expects { username: 'email', password: 'password' }
    const response = await api.post('/auth/login', {
      username: credentials.email,
      password: credentials.password,
    });
    console.log('DEBUG: Backend login response:', response.data);
    return {
      token: response.data.access_token,
      user: response.data.user
    };
  },
};

export const casesApi = {
  fetchCases: async () => {
    const response = await api.get('/cases');
    return response.data;
  },
  fetchCaseById: async (caseId) => {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  },
  fetchCaseFullDetails: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/full-details`);
    return response.data;
  },
  fetchAuditLog: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/audit-log`);
    return response.data;
  },
  createCase: async (payload) => {
    const response = await api.post('/cases', payload);
    return response.data;
  },
  syncEhr: async (caseId) => {
    const response = await api.post(`/cases/${caseId}/sync`);
    return response.data;
  },
  fetchGapAnalysis: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/gap-analysis`);
    return response.data;
  },
  uploadGapData: async (caseId, payload) => {
    // We always use the new upload-file endpoint with FormData to handle both files and text fields
    const formData = new FormData();
    
    if (payload.file) {
      formData.append('file', payload.file);
    }
    
    formData.append('document_name', payload.document_name);
    formData.append('missing_key', payload.missing_key);
    
    if (payload.field_value) {
      formData.append('field_value', payload.field_value);
    }

    const response = await api.post(`/cases/${caseId}/upload-file`, formData);
    return response.data;
  },
  bulkUploadGapData: async (caseId, payload) => {
    const response = await api.post(`/cases/${caseId}/bulk-upload`, payload);
    return response.data;
  },
  previewPaPackage: (caseId) => {
    return `${API_BASE_URL}/cases/${caseId}/preview`;
  },
  submitCase: async (caseId) => {
    const response = await api.post(`/cases/${caseId}/submit`);
    return response.data;
  },
};

export default api;
