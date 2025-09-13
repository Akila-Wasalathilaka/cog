// Enhanced company authentication and management system
export interface Company {
  id: string;
  name: string;
  email: string;
  domain: string; // Company email domain (e.g., "@microsoft.com")
  password: string; // In real app, this would be hashed
  is_verified: boolean;
  subscription_plan: 'free' | 'premium' | 'enterprise';
  created_at: string;
  last_login_at?: string;
  settings: {
    max_candidates: number;
    assessment_time_limit: number;
    custom_branding: boolean;
  };
}

export interface AdminUser {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  password: string;
  is_active: boolean;
  created_at: string;
}

// Mock data for companies
const companies: Company[] = [
  {
    id: 'comp_1',
    name: 'Tech Solutions Inc',
    email: 'admin@techsolutions.com',
    domain: '@techsolutions.com',
    password: 'CompanyPass123!',
    is_verified: true,
    subscription_plan: 'premium',
    created_at: '2024-01-01T00:00:00Z',
    last_login_at: '2024-01-15T09:00:00Z',
    settings: {
      max_candidates: 100,
      assessment_time_limit: 60,
      custom_branding: true
    }
  },
  {
    id: 'comp_2',
    name: 'DataCorp Analytics',
    email: 'hr@datacorp.com',
    domain: '@datacorp.com',
    password: 'SecurePass456!',
    is_verified: true,
    subscription_plan: 'enterprise',
    created_at: '2024-01-02T00:00:00Z',
    settings: {
      max_candidates: 500,
      assessment_time_limit: 90,
      custom_branding: true
    }
  },
  {
    id: 'comp_test',
    name: 'Test Company',
    email: 'admin',
    domain: '@test.com',
    password: 'admin',
    is_verified: true,
    subscription_plan: 'free',
    created_at: '2025-09-02T00:00:00Z',
    settings: {
      max_candidates: 50,
      assessment_time_limit: 45,
      custom_branding: false
    }
  }
];

// Mock admin users
const adminUsers: AdminUser[] = [
  {
    id: 'admin_1',
    company_id: 'comp_1',
    email: 'admin@techsolutions.com',
    full_name: 'Admin User',
    password: 'AdminPass123!',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Enhanced helper functions
export function extractDomain(email: string): string {
  return '@' + email.split('@')[1]?.toLowerCase() || '';
}

export function isValidCompanyEmail(email: string): boolean {
  const domain = extractDomain(email);
  return companies.some(company => 
    company.domain.toLowerCase() === domain.toLowerCase() && company.is_verified
  );
}

// Enhanced company store with authentication
export const companiesStore = {
  getAll: () => [...companies],
  
  getById: (id: string) => companies.find(c => c.id === id),
  
  getByEmail: (email: string) => companies.find(c => c.email === email),
  
  getByDomain: (domain: string) => companies.find(c => c.domain === domain),
  
  validateLogin: (email: string, password: string) => {
    return companies.find(c => 
      c.email === email && 
      c.password === password && 
      c.is_verified
    );
  },
  
  validateCompanyEmail: (email: string) => {
    const emailDomain = extractDomain(email);
    return companies.find(c => c.domain === emailDomain);
  },
  
  register: (companyData: {
    name: string;
    email: string;
    password: string;
    domain?: string;
  }) => {
    const domain = companyData.domain || extractDomain(companyData.email);
    
    // Check if company with this domain already exists
    const existingCompany = companies.find(c => c.domain === domain);
    if (existingCompany) {
      throw new Error('Company with this domain already exists');
    }
    
    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: companyData.name,
      email: companyData.email,
      domain: domain,
      password: companyData.password,
      is_verified: true, // Auto-verify for demo
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      settings: {
        max_candidates: 10,
        assessment_time_limit: 30,
        custom_branding: false
      }
    };
    
    companies.push(newCompany);
    return newCompany;
  },
  
  update: (id: string, updates: Partial<Company>) => {
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    companies[index] = { ...companies[index], ...updates };
    return companies[index];
  },
  
  updateLastLogin: (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      company.last_login_at = new Date().toISOString();
      return company;
    }
    return null;
  },
  
  canCreateCandidates: (companyId: string, currentCandidateCount: number) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return false;
    
    return currentCandidateCount < company.settings.max_candidates;
  }
};

export const adminUsersStore = {
  getAll: () => [...adminUsers],
  
  getByEmail: (email: string) => adminUsers.find(u => u.email === email),

  getById: (id: string) => adminUsers.find(u => u.id === id),

  getByCompanyId: (companyId: string) => adminUsers.filter(u => u.company_id === companyId),
  
  validateLogin: (email: string, password: string) => {
    return adminUsers.find(u => 
      u.email === email && 
      u.password === password && 
      u.is_active
    );
  },

  create: (userData: {
    company_id: string;
    email: string;
    full_name: string;
    password: string;
  }) => {
    const newUser: AdminUser = {
      ...userData,
      id: `admin_${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString()
    };
    adminUsers.push(newUser);
    return newUser;
  },

  update: (id: string, updates: Partial<AdminUser>) => {
    const index = adminUsers.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    adminUsers[index] = { ...adminUsers[index], ...updates };
    return adminUsers[index];
  },
  
  delete: (id: string) => {
    const index = adminUsers.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    adminUsers.splice(index, 1);
    return true;
  }
};
