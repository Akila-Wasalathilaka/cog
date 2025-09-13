'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateTokenAndRole, useSecureLogout, SecureLogout } from '@/lib/auth/secure-logout';

interface Candidate {
  id: string;
  username: string;
  email: string;
  full_name: string;
  job_role_id: string;
  job_role_title: string;
  password?: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string;
  assessment_count: number;
  completed_assessments: number;
}

interface JobRole {
  id: string;
  title: string;
  description: string;
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const router = useRouter();
  const { logout } = useSecureLogout();

  useEffect(() => {
    // Setup page protection to prevent back button access after logout
    SecureLogout.setupPageProtection();

    // Validate authentication and role
    const validation = validateTokenAndRole('ADMIN');
    if (!validation.isValid) {
      console.error('Authentication failed on page load:', validation.error);
      router.replace('/auth/login');
      return;
    }

    fetchCandidates();
    fetchJobRoles(); // Also fetch job roles for the dropdown
  }, [statusFilter, router]);

  const fetchCandidates = async () => {
    console.log('Fetching candidates...');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('is_active', statusFilter === 'active' ? 'true' : 'false');
      }

      const url = `/api/admin/candidates?${params}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched candidates data:', data);
        console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          setCandidates(data.map((candidate: any) => ({
            ...candidate,
            job_role_title: candidate.job_role_title || 'Not Assigned',
            assessment_count: candidate.assessment_count || 0,
            completed_assessments: candidate.completed_assessments || 0
          })));
        } else {
          console.error('Data is not an array:', data);
          setCandidates([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Fetch failed with status:', response.status, 'Error:', errorText);
        setCandidates([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setCandidates([]);
      setLoading(false);
    }
  };

  const fetchJobRoles = async () => {
    console.log('Fetching job roles...');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch('/api/admin/job-roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Job roles fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched job roles data:', data);
        
        if (Array.isArray(data)) {
          setJobRoles(data);
        } else if (data.items && Array.isArray(data.items)) {
          // In case the API returns paginated results
          setJobRoles(data.items);
        } else {
          console.error('Job roles data is not an array:', data);
          setJobRoles([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Job roles fetch failed with status:', response.status, 'Error:', errorText);
        setJobRoles([]);
      }
    } catch (err) {
      console.error('Job roles fetch error:', err);
      setJobRoles([]);
    }
  };

  const handleStatusChange = async (candidateId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (response.ok) {
        fetchCandidates(); // Refresh the list
      } else {
        alert('Failed to update candidate status');
      }
    } catch (err) {
      alert('Error updating candidate status');
    }
  };

  const handleDelete = async (candidateId: string) => {
    console.log('DELETE CLICKED for ID:', candidateId);
    console.log('Current candidates before delete:', candidates.map(c => c.id));
    
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    console.log('User confirmed delete, removing from UI...');
    // Remove from UI instantly
    setCandidates(prev => {
      const filtered = prev.filter(c => c.id !== candidateId);
      console.log('New candidates after filter:', filtered.map(c => c.id));
      return filtered;
    });
    
    try {
      const token = localStorage.getItem('access_token');
      console.log('Making DELETE API call to:', `/api/admin/candidates/${candidateId}`);
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('DELETE API response status:', response.status);
      
      if (!response.ok) {
        console.log('DELETE API failed, restoring candidate');
        // If delete failed, restore the candidate
        fetchCandidates();
        const error = await response.json();
        alert(`Failed to delete candidate: ${error.error || 'Unknown error'}`);
      } else {
        console.log('DELETE API succeeded');
      }
    } catch (err) {
      console.log('DELETE API error:', err);
      // If delete failed, restore the candidate
      fetchCandidates();
      alert('Error deleting candidate');
    }
  };

  const handleCreateCandidate = async (formData: FormData) => {
    setCreateLoading(true);
    try {
      const jobRoleId = formData.get('job_role_id') as string || '';
      const candidateName = formData.get('full_name') as string;
      const email = formData.get('email') as string;
      const jobRole = jobRoles.find(jr => jr.id === jobRoleId);
      
      // Generate username from email or name
      const username = email ? email.split('@')[0] : candidateName.toLowerCase().replace(/\s+/g, '');
      
      console.log(`🎯 Creating candidate ${candidateName} for ${jobRole?.title || 'No role assigned'} role...`);
      
      // Use the new with-assessment endpoint if job role is selected
      const apiEndpoint = jobRoleId ? '/api/admin/candidates/with-assessment' : '/api/admin/candidates';
      const requestBody = jobRoleId ? {
        username: username,
        email: email,
        full_name: candidateName,
        job_role_id: jobRoleId,
        auto_generate_games: true
      } : {
        username: username,
        email: email,
        full_name: candidateName,
        job_role_id: jobRoleId || null
      };
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Enhanced success message with assessment details
        const baseMessage = `🎉 Candidate Created Successfully!\n\n` +
                           `👤 Candidate: ${result.full_name}\n` +
                           `💼 Job Role: ${jobRole?.title || 'No role assigned'}\n` +
                           `🔐 Login Credentials:\n` +
                           `   Username: ${result.username}\n` +
                           `   Password: ${result.temporary_password}\n\n`;
        
        const assessmentMessage = result.assessment_id ? 
          `🧠 Assessment Status:\n` +
          `   ✅ AI-powered cognitive assessment auto-generated\n` +
          `   🎮 ${result.generated_games_count} cognitive games created\n` +
          `   📊 Assessment ID: ${result.assessment_id}\n` +
          `   🎯 Games tailored for ${jobRole?.title} role\n\n` +
          `📋 Next Steps:\n` +
          `1. Share login credentials with candidate\n` +
          `2. Candidate can access assessment via login\n` +
          `3. Monitor progress in admin dashboard\n\n` 
          : 
          `📋 Next Steps:\n` +
          `1. Share login credentials with candidate\n` +
          `2. Assign job role to generate assessment\n\n`;
        
        const warningMessage = `⚠️ Please save these credentials - they won't be shown again!`;
        
        alert(baseMessage + assessmentMessage + warningMessage);
        setShowCreateModal(false);
        fetchCandidates(); // Refresh list
        
        console.log(`✅ Successfully created candidate ${candidateName}${result.assessment_id ? ' with AI-generated assessment' : ''}`);
      } else {
        const error = await response.text();
        alert(`❌ Failed to create candidate: ${error}`);
        console.error('Candidate creation failed:', error);
      }
    } catch (err) {
      alert('❌ Error creating candidate - please try again');
      console.error('Candidate creation error:', err);
    }
    setCreateLoading(false);
  };

  const filteredCandidates = useMemo(() => {
    console.log('Recomputing filtered candidates. Total candidates:', candidates.length);
    console.log('Candidates:', candidates);
    console.log('Status filter:', statusFilter, 'Search term:', searchTerm);
    
    const filtered = candidates.filter(candidate => {
      // Apply status filter
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if (candidate.is_active !== isActive) {
          return false;
        }
      }
      
      // Apply search filter
      return candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             candidate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (candidate.full_name && candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    console.log('Filtered candidates:', filtered.length, filtered);
    return filtered;
  }, [candidates, statusFilter, searchTerm]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-red-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Candidates</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchCandidates}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/50 rounded-full px-6 py-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Cognihire
                  </h1>
                </div>
                <div className="ml-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300 border border-blue-600/50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-600/50">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-300 hidden sm:block">Administrator</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm border border-red-500/50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Candidate Management</h2>
              <p className="text-slate-300">Manage and monitor all candidates in the system</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Candidate
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
                  Search Candidates
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
                  Status Filter
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Login Credentials
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Job Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Assessments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {(() => {
                  console.log('Rendering table with filtered candidates:', filteredCandidates.length);
                  console.log('Candidate IDs:', filteredCandidates.map(c => c.id));
                  return filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {candidate.full_name || candidate.username}
                        </div>
                        <div className="text-sm text-slate-400">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs">
                        <div className="text-slate-300">
                          <span className="font-medium">Username:</span> 
                          <span className="ml-1 font-mono bg-slate-700 px-2 py-1 rounded">{candidate.username}</span>
                        </div>
                        <div className="text-slate-300 mt-1">
                          <span className="font-medium">Password:</span> 
                          <span className="ml-1 font-mono bg-slate-700 px-2 py-1 rounded">{candidate.password}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">
                        {candidate.job_role_title || 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {candidate.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {candidate.completed_assessments}/{candidate.assessment_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {candidate.last_login_at
                        ? new Date(candidate.last_login_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/candidates/${candidate.id}`)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleStatusChange(candidate.id, !candidate.is_active)}
                          className={`${
                            candidate.is_active
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-green-400 hover:text-green-300'
                          } transition-colors`}
                        >
                          {candidate.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
                })()}
              </tbody>
            </table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Candidates Found</h3>
              <p className="text-slate-400">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first candidate.'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Create Candidate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Candidate</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateCandidate(new FormData(e.target as HTMLFormElement));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email (Optional)</label>
                  <input
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="candidate@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Job Role</label>
                  <select
                    name="job_role_id"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Job Role (Optional)</option>
                    {jobRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {createLoading ? '🧠 Creating candidate & generating AI assessment...' : 'Create Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}