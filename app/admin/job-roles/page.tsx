'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateTokenAndRole, useSecureLogout, SecureLogout } from '@/lib/auth/secure-logout';

interface JobRole {
  id: string;
  title: string;
  description: string;
  traits_json: any;
  config_json: any;
  created_at: string;
}

export default function AdminJobRolesPage() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

    fetchJobRoles();
  }, [router]);

  const fetchJobRoles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch('/api/job-roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch job roles');
      }

      const data = await response.json();
      setJobRoles(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job roles');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateJobRole = async (formData: FormData) => {
    setCreateLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch('/api/job-roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description')
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Job role created successfully!');
        setShowCreateModal(false);
        fetchJobRoles(); // Refresh list
      } else {
        const error = await response.json();
        alert(`Failed to create job role: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error creating job role');
    }
    setCreateLoading(false);
  };

  const handleDelete = async (jobRoleId: string) => {
    if (!confirm('Are you sure you want to delete this job role? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`/api/job-roles/${jobRoleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If delete failed, restore the job role back to the list
        fetchJobRoles();
        const error = await response.json();
        alert(`Failed to delete job role: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      // If delete failed, restore the job role back to the list
      fetchJobRoles();
      alert('Error deleting job role');
    }
  };

  const handleAnalyze = async (jobRoleId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`/api/job-roles/${jobRoleId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job role');
      }

      const result = await response.json();
      alert(`Analysis complete! Traits: ${Object.keys(result.traits).join(', ')}`);

      // Refresh the job roles list
      fetchJobRoles();
    } catch (err) {
      alert('Failed to analyze job role');
    }
  };

  const filteredJobRoles = jobRoles.filter(role =>
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading job roles...</p>
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
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Job Roles</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchJobRoles}
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
              <h2 className="text-3xl font-bold text-white mb-2">Job Role Management</h2>
              <p className="text-slate-300">Create and manage job roles with cognitive trait requirements</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Job Role
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-6">
          <div className="p-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
                Search Job Roles
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Job Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobRoles.map((role) => (
            <div key={role.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">{role.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-300 mb-4 line-clamp-3">{role.description}</p>

                {/* Traits */}
                {role.traits_json && Object.keys(role.traits_json).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Required Traits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(role.traits_json).map(([trait, details]: [string, any]) => (
                        <span
                          key={trait}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            details.required
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {trait.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                  <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/job-roles/${role.id}`)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAnalyze(role.id)}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      Analyze
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobRoles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a4 4 0 01-4 4H8a4 4 0 01-4-4V6m8 0V6a4 4 0 014-4h4a4 4 0 014 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Job Roles Found</h3>
            <p className="text-slate-400">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first job role.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Create Job Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Create New Job Role</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateJobRole(formData);
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role and responsibilities..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {createLoading ? 'Creating...' : 'Create Job Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}