
// Simple mock API to simulate Nikhil & Hareesh's backend logic for Day 1
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Status color logic (can be exported or used in common components)
export const STATUS_MAP = {
  PROCESSING: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  APPROVED: { label: 'Approved', color: 'text-green-600 bg-green-50 border-green-100' },
  DENIED: { label: 'Denied', color: 'text-red-600 bg-red-50 border-red-100' },
  DRAFT: { label: 'Draft', color: 'text-slate-500 bg-slate-100 border-slate-200' },
};

const mockCases = [
  {
    case_id: 'PA-20260305-0001',
    patient_name: 'John Smith',
    procedure: 'Cardiac MRI',
    cpt_code: '75563',
    status: 'PAYER_APPROVED',
    created_at: '2026-03-05 10:30',
    insurance: 'United Healthcare'
  },
  {
    case_id: 'PA-20260305-0012',
    patient_name: 'Sarah Connor',
    procedure: 'Echo Doppler',
    cpt_code: '93306',
    status: 'UNDER_REVIEW',
    created_at: '2026-03-05 14:45',
    insurance: 'Aetna'
  },
  {
    case_id: 'PA-20260306-0005',
    patient_name: 'Robert Brown',
    procedure: 'CT Chest',
    cpt_code: '71250',
    status: 'DRAFT',
    created_at: '2026-03-06 09:15',
    insurance: 'Cigna'
  }
];

export const authApi = {
  login: async (username, password) => {
    await delay(1000);
    if (username && password) { // Simple auth
      return { 
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
        user: { name: 'Akshay', role: 'PA Coordinator' } 
      };
    }
    throw new Error('Invalid credentials');
  }
};

export const casesApi = {
  fetchCases: async () => {
    await delay(800);
    return [...mockCases];
  },
  createCase: async (payload) => {
    await delay(1200);
    const newCase = {
      case_id: `PA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0042`,
      status: 'DRAFT',
      patient_name: payload.patientName || 'TBD',
      procedure: `CPT: ${payload.cptCode}`,
      cpt_code: payload.cptCode,
      insurance: payload.insuranceName,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    mockCases.unshift(newCase);
    return newCase;
  }
};
