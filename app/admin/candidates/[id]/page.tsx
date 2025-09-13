'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Candidate {
  id: string;
  username: string;
  email: string;
  full_name: string;
  job_role_id: string;
  job_role_title: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  assessment_count: number;
  completed_assessments: number;
}

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      } else {
        setError('Failed to fetch candidate details');
      }
    } catch (err) {
      setError('Error loading candidate details');
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus })
      });
      
      if (response.ok) {
        const updatedCandidate = await response.json();
        setCandidate(updatedCandidate);
      } else {
        alert('Failed to update candidate status');
      }
    } catch (err) {
      alert('Error updating candidate status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Candidate deleted successfully');
        router.push('/admin/candidates');
      } else {
        alert('Failed to delete candidate');
      }
    } catch (err) {
      alert('Error deleting candidate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-red-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Candidate</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/candidates')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/candidates')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-white">Candidate Details</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleStatusChange(!candidate.is_active)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                candidate.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {candidate.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Delete Candidate
            </button>
          </div>
        </div>

        {/* Candidate Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <p className="text-white text-lg">{candidate.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <p className="text-white">{candidate.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <p className="text-white">{candidate.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    candidate.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {candidate.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Job & Assessment Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Job & Assessment Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Job Role</label>
                  <p className="text-white text-lg">{candidate.job_role_title || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Assessment Progress</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${candidate.assessment_count > 0 
                            ? (candidate.completed_assessments / candidate.assessment_count) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-slate-300 text-sm">
                      {candidate.completed_assessments}/{candidate.assessment_count}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Created Date</label>
                  <p className="text-white">{new Date(candidate.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Login</label>
                  <p className="text-white">
                    {candidate.last_login_at
                      ? new Date(candidate.last_login_at).toLocaleDateString()
                      : 'Never logged in'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Assessment History</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Assessments Yet</h3>
            <p className="text-slate-400">
              This candidate hasn&apos;t completed any assessments yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
