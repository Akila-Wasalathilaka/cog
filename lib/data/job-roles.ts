// Enhanced job roles with cognitive requirements for AI game generation
// In a real app, this would be replaced with a proper database

export interface JobRole {
  id: string;
  company_id: string;
  title: string;
  description: string;
  cognitive_requirements: {
    memory: number; // 1-5 scale
    attention: number;
    reasoning: number;
    processing_speed: number;
    spatial: number;
  };
  created_at: string;
}

// Enhanced mock data with cognitive requirements for AI game generation
const jobRoles: JobRole[] = [
  {
    id: '1',
    company_id: 'comp_1',
    title: 'Software Developer',
    description: 'Design and develop software applications',
    cognitive_requirements: {
      memory: 4,
      attention: 5,
      reasoning: 5,
      processing_speed: 4,
      spatial: 3
    },
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    company_id: 'comp_1',
    title: 'Data Analyst',
    description: 'Analyze data to help make business decisions',
    cognitive_requirements: {
      memory: 4,
      attention: 5,
      reasoning: 5,
      processing_speed: 3,
      spatial: 4
    },
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    company_id: 'comp_1',
    title: 'UX Designer',
    description: 'Design user experiences for digital products',
    cognitive_requirements: {
      memory: 3,
      attention: 4,
      reasoning: 4,
      processing_speed: 3,
      spatial: 5
    },
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    company_id: 'comp_1',
    title: 'Project Manager',
    description: 'Manage projects and coordinate team efforts',
    cognitive_requirements: {
      memory: 4,
      attention: 5,
      reasoning: 4,
      processing_speed: 4,
      spatial: 2
    },
    created_at: new Date().toISOString()
  }
];

export const jobRolesStore = {
  getAll: () => [...jobRoles],
  
  getById: (id: string) => jobRoles.find(jr => jr.id === id),
  
  getByTitle: (title: string) => jobRoles.find(jr => jr.title === title),

  getByCompanyId: (companyId: string) => jobRoles.filter(jr => jr.company_id === companyId),
  
  add: (jobRoleData: Omit<JobRole, 'id' | 'created_at'>) => {
    const newJobRole: JobRole = {
      ...jobRoleData,
      id: `jr_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    jobRoles.push(newJobRole);
    return newJobRole;
  },
  
  update: (id: string, updates: Partial<JobRole>) => {
    const index = jobRoles.findIndex(jr => jr.id === id);
    if (index === -1) return null;
    
    jobRoles[index] = { ...jobRoles[index], ...updates };
    return jobRoles[index];
  },
  
  delete: (id: string) => {
    const index = jobRoles.findIndex(jr => jr.id === id);
    if (index === -1) return false;
    
    jobRoles.splice(index, 1);
    return true;
  }
};
