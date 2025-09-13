// Enhanced candidates data store with auto-generated credentials
// In a real app, this would be replaced with a proper database

import { jobRolesStore } from './job-roles';

export interface Candidate {
  id: string;
  company_id: string;
  username: string;
  password: string; // Store for display purposes (in real app, would be hashed)
  email: string;
  full_name: string;
  job_role_id: string;
  job_role_title: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  assessment_count: number;
  completed_assessments: number;
  total_score?: number;
  cognitive_profile?: {
    memory: number;
    attention: number;
    reasoning: number;
    processing_speed: number;
    spatial: number;
  };
}

// Helper functions for auto-generation
function generateUsername(fullName: string): string {
  const names = fullName.toLowerCase().split(' ');
  const firstName = names[0] || '';
  const lastName = names[names.length - 1] || '';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}${lastName}${randomNum}`.replace(/[^a-z0-9]/g, '');
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Enhanced mock data
const candidates: Candidate[] = [
  {
    id: 'cand_1',
    company_id: 'comp_1',
    username: 'johndoe1234',
    password: 'Temp123!',
    email: 'john@example.com',
    full_name: 'John Doe',
    job_role_id: '1',
    job_role_title: 'Software Developer',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    last_login_at: null,
    assessment_count: 0,
    completed_assessments: 0
  },
  {
    id: 'cand_2',
    company_id: 'comp_1', 
    username: 'janesmith5678',
    password: 'Pass456!',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    job_role_id: '2',
    job_role_title: 'Data Analyst',
    is_active: true,
    created_at: '2024-01-16T14:30:00Z',
    last_login_at: null,
    assessment_count: 0,
    completed_assessments: 0
  },
  {
    id: 'cand_3',
    company_id: 'comp_1',
    username: 'test123',
    password: 'test123',
    email: 'test@cognihire.com',
    full_name: 'Test User',
    job_role_id: '1',
    job_role_title: 'Software Developer',
    is_active: true,
    created_at: '2025-09-02T10:00:00Z',
    last_login_at: null,
    assessment_count: 1,
    completed_assessments: 0
  },
  {
    id: 'cand_4',
    company_id: 'comp_1',
    username: 'demo',
    password: 'demo123',
    email: 'demo@cognihire.com',
    full_name: 'Demo Candidate',
    job_role_id: '3',
    job_role_title: 'UX Designer',
    is_active: true,
    created_at: '2025-09-02T11:00:00Z',
    last_login_at: null,
    assessment_count: 2,
    completed_assessments: 1,
    total_score: 85,
    cognitive_profile: {
      memory: 88,
      attention: 82,
      reasoning: 90,
      processing_speed: 85,
      spatial: 80
    }
  },
  {
    id: 'cand_5',
    company_id: 'comp_1',
    username: 'candidate1',
    password: 'password',
    email: 'candidate1@cognihire.com',
    full_name: 'Sarah Johnson',
    job_role_id: '2',
    job_role_title: 'Data Analyst',
    is_active: true,
    created_at: '2025-09-02T12:00:00Z',
    last_login_at: null,
    assessment_count: 3,
    completed_assessments: 2,
    total_score: 92,
    cognitive_profile: {
      memory: 95,
      attention: 90,
      reasoning: 93,
      processing_speed: 88,
      spatial: 94
    }
  }
];

// CRUD operations with auto-generation
export const candidatesStore = {
  getAll: () => [...candidates],
  
  getById: (id: string) => candidates.find(c => c.id === id),

  getByCompanyId: (companyId: string) => candidates.filter(c => c.company_id === companyId),

  getByUsername: (username: string) => candidates.find(c => c.username === username),

  validateLogin: (login: string, password: string) => {
    return candidates.find(c => 
      (c.username === login || c.email === login) && 
      c.password === password && 
      c.is_active
    );
  },
  
  create: async (candidateData: { full_name: string; email?: string; job_role_id: string; company_id: string }) => {
    const jobRole = jobRolesStore.getById(candidateData.job_role_id);

    // Always auto-generate username and password
    const username = generateUsername(candidateData.full_name || 'candidate');
    let password = generatePassword();
    // Fallback in case password generation fails
    if (!password || typeof password !== 'string') password = 'Temp' + Math.floor(1000 + Math.random() * 9000);

    const newCandidate: Candidate = {
      id: `cand_${Date.now()}`,
      company_id: candidateData.company_id,
      username,
      password,
      email: candidateData.email || '',
      full_name: candidateData.full_name,
      job_role_id: candidateData.job_role_id,
      job_role_title: jobRole?.title || 'Not Assigned',
      is_active: true,
      created_at: new Date().toISOString(),
      last_login_at: null,
      assessment_count: 1, // Will have 1 auto-generated assessment
      completed_assessments: 0
    };

    candidates.push(newCandidate);

    // Auto-create assessment using Mistral AI
    try {
      const { assessmentSessionsStore } = await import('./assessments');
      await assessmentSessionsStore.createAssessmentForCandidate(newCandidate.id, candidateData.job_role_id);
      console.log(`Auto-generated assessment for candidate: ${newCandidate.full_name}`);
    } catch (error) {
      console.error('Failed to auto-create assessment:', error);
    }
    return newCandidate;
  },
  
  update: (id: string, updates: Partial<Candidate>) => {
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    // Update job role title if job_role_id is being updated
    if (updates.job_role_id) {
      const jobRole = jobRolesStore.getById(updates.job_role_id);
      if (jobRole) {
        updates.job_role_title = jobRole.title;
      }
    }
    
    candidates[index] = { ...candidates[index], ...updates };
    return candidates[index];
  },
  
  delete: (id: string) => {
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    candidates.splice(index, 1);
    return true;
  },

  updateLastLogin: (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    if (candidate) {
      candidate.last_login_at = new Date().toISOString();
      return candidate;
    }
    return null;
  }
};
