'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CandidateProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  job_role_id: string;
  job_role_title: string;
  assessment_count: number;
  completed_assessments: number;
  cognitive_profile?: {
    memory_score: number;
    attention_score: number;
    reasoning_score: number;
    processing_speed_score: number;
    spatial_reasoning_score: number;
    overall_percentile: number;
  };
}

interface AssessmentSession {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  candidate_id: string;
  job_role_id: string;
  job_role_title: string;
  started_at?: string;
  completed_at?: string;
  total_score?: number;
  progress_percentage: number;
  cognitive_games: {
    id: string;
    game_id: string;
    type: string;
    title: string;
    description: string;
    time_limit: number;
    order_index: number;
    status: string;
  }[];
}

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSession[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentAttempts, setAssessmentAttempts] = useState<{[assessmentId: string]: number}>({});
  const router = useRouter();

  // Computed values
  const assessmentHistory = assessments.filter(a => a.status === 'COMPLETED');

  useEffect(() => {
    fetchCandidateData();
    
    // Load attempt counts from localStorage
    const savedAttempts = localStorage.getItem('assessmentAttempts');
    if (savedAttempts) {
      try {
        setAssessmentAttempts(JSON.parse(savedAttempts));
      } catch (err) {
        console.error('Failed to parse saved assessment attempts:', err);
      }
    }
  }, []);

  // Save attempt counts to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(assessmentAttempts).length > 0) {
      localStorage.setItem('assessmentAttempts', JSON.stringify(assessmentAttempts));
    }
  }, [assessmentAttempts]);

  const fetchCandidateData = async () => {
    try {
      // Get user data from localStorage (set during login)
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (!userStr || !accessToken) {
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(userStr);
      if (user.role?.toUpperCase() !== 'CANDIDATE') {
        router.push('/admin/dashboard');
        return;
      }

      // Fetch candidate profile from backend for up-to-date info
      let profile = null;
      try {
        const profileRes = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (profileRes.ok) {
          profile = await profileRes.json();
        }
      } catch (e) {
        // fallback to user from localStorage if profile fetch fails
        profile = user;
      }

      setCandidate({
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name || profile.username,
        email: profile.email || '',
        job_role_id: profile.job_role_id,
        job_role_title: profile.job_role_title || 'Unknown',
        assessment_count: 0, // Will be updated after fetching assessments
        completed_assessments: 0, // Will be updated after fetching assessments
        cognitive_profile: profile.cognitive_profile
      });

      // Fetch assessments for this candidate
      const assessmentsResponse = await fetch(`/api/candidate/assessments`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`
        } : {}
      });
      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json();
        setAssessments(assessmentsData);
        // Update assessment counts based on actual data
        const completedCount = assessmentsData.filter((a: AssessmentSession) => a.status === 'COMPLETED').length;
        setCandidate(prev => prev ? {
          ...prev,
          assessment_count: assessmentsData.length,
          completed_assessments: completedCount
        } : null);
        // Find current active assessment
        const activeAssessment = assessmentsData.find((a: AssessmentSession) => 
          a.status === 'NOT_STARTED' || a.status === 'IN_PROGRESS'
        );
        setCurrentAssessment(activeAssessment || null);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all stored authentication data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Clear cookie
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/auth/login');
    }
  };

  const handleStartAssessment = (assessmentId?: string) => {
    const targetId = assessmentId || currentAssessment?.id;
    if (!targetId) return;

    // Increment attempt count (for tracking purposes only)
    const currentAttempts = assessmentAttempts[targetId] || 0;
    setAssessmentAttempts(prev => ({
      ...prev,
      [targetId]: currentAttempts + 1
    }));

    router.push(`/candidate/assessment/${targetId}`);
  };

  const handleViewAssessment = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment?.status === 'COMPLETED') {
      // For completed assessments, show results
      router.push(`/candidate/assessment/${assessmentId}/results`);
    } else {
      // For in-progress assessments, continue the assessment
      router.push(`/candidate/assessment/${assessmentId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20';
      case 'IN_PROGRESS':
        return 'bg-blue-900/20 text-blue-400 border-blue-400/20';
      case 'COMPLETED':
        return 'bg-green-900/20 text-green-400 border-green-400/20';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-red-900/20 text-red-400 border-red-400/20';
      default:
        return 'bg-slate-700/20 text-slate-400 border-slate-400/20';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'IN_PROGRESS':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'EXPIRED':
      case 'CANCELLED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={fetchCandidateData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CogniHire
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-300">
                  Welcome, {candidate?.full_name || candidate?.username || 'Candidate'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Candidate Dashboard</h2>
          <p className="text-slate-400">Manage your cognitive assessments and track your progress</p>
        </div>

        {/* Profile Card */}
        {candidate && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <p className="text-lg font-semibold text-white">{candidate.full_name}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Job Role</label>
                  <p className="text-lg font-semibold text-white">{candidate.job_role_title}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Assessments</label>
                  <p className="text-lg font-semibold text-white">
                    {candidate.completed_assessments}/{candidate.assessment_count}
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                  <p className="text-lg font-semibold text-blue-400 font-mono">{candidate.username}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Assessment */}
        {currentAssessment ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Current Assessment
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentAssessment.status)}`}>
                      {getStatusIcon(currentAssessment.status)}
                      <span className="ml-2">{formatStatus(currentAssessment.status)}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cognitive Games</label>
                  <p className="text-lg font-semibold text-white">{currentAssessment.cognitive_games?.length || 0} Games</p>
                </div>
                {currentAssessment.total_score !== undefined && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Total Score</label>
                    <p className="text-2xl font-bold text-green-400">{currentAssessment.total_score}%</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                {currentAssessment.status === 'NOT_STARTED' && (
                  <div className="text-center">
                    <button
                      onClick={() => handleStartAssessment()}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Assessment
                    </button>
                  </div>
                )}
                {currentAssessment.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStartAssessment()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Continue Assessment
                  </button>
                )}
                {currentAssessment.status === 'COMPLETED' && (
                  <div className="text-center">
                    <div className="mb-4">
                      <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg text-white mb-2">Assessment Completed!</p>
                    <p className="text-slate-400">Check your results below</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Waiting for Assessment
              </h3>
            </div>
            <div className="p-6 text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg text-white mb-2">No Assessment Assigned Yet</p>
                <p className="text-slate-400 mb-6">Your administrator will assign a cognitive assessment for your job role. You&apos;ll be notified when it&apos;s ready.</p>
                <div className="bg-slate-700/30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-slate-300">
                    <strong>What happens next:</strong><br />
                    • Admin creates your assessment<br />
                    • AI generates job-specific games<br />
                    • You&apos;ll see the assessment here<br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assessment History */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Assessment History
            </h3>
          </div>
          <div className="p-6">
            {assessmentHistory.length > 0 ? (
              <div className="space-y-4">
                {assessmentHistory.map((assessment) => (
                  <div key={assessment.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">Assessment #{assessment.id}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assessment.status)}`}>
                            {getStatusIcon(assessment.status)}
                            <span className="ml-2">{formatStatus(assessment.status)}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-slate-400">Started</p>
                            <p className="text-white">
                              {assessment.started_at 
                                ? new Date(assessment.started_at).toLocaleDateString()
                                : 'Not started'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Games</p>
                            <p className="text-white">{assessment.cognitive_games?.length || 0} Games</p>
                          </div>
                          {assessment.total_score !== undefined && (
                            <div>
                              <p className="text-sm text-slate-400">Score</p>
                              <p className="text-green-400 font-semibold">{assessment.total_score}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {assessment.status === 'NOT_STARTED' && (
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {assessment.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Continue
                        </button>
                      )}
                      {assessment.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No Assessment History</h3>
                <p className="text-slate-400">Complete your first assessment to see your history here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
