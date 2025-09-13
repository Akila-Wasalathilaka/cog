'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssessmentResult {
  id: string;
  candidate_id: string;
  job_role_id: string;
  status: string;
  total_score: number;
  completed_at: string;
  game_results: any[];
  cognitive_games?: any[];
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.replace('/auth/login');
          return;
        }

        const response = await fetch(`/api/assessments/${assessmentId}/results`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data);
        } else if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.replace('/auth/login');
        } else {
          setError('Failed to load assessment results');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading results...</p>
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
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Results</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-slate-700 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">No Results Found</h2>
          <p className="text-slate-400 mb-6">Assessment results could not be found.</p>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Assessment Results</h1>
              <p className="text-slate-400 mt-1">Assessment ID: {assessmentId}</p>
            </div>
            <Link
              href="/candidate/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assessment Completed Successfully
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Total Score</h3>
                <p className="text-3xl font-bold text-blue-400">{result.total_score || 0}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                <p className="text-green-400 font-semibold">{result.status}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Completed At</h3>
                <p className="text-slate-300">
                  {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Assessment Summary</h3>
              <p className="text-slate-300 mb-4">
                Congratulations! You have successfully completed your cognitive assessment.
                Your results have been recorded and will be reviewed by the hiring team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/candidate/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-center"
                >
                  Return to Dashboard
                </Link>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Print Results
                </button>
              </div>
            </div>

            {/* Individual Game Results */}
            {result.game_results && result.game_results.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Individual Game Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.game_results.map((game: any, index: number) => (
                    <div key={index} className="bg-slate-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">{game.gameType || 'Game'} {index + 1}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Score:</span>
                          <span className="text-blue-400 font-semibold">{game.score || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Accuracy:</span>
                          <span className="text-green-400">{game.accuracy ? Math.round(game.accuracy) : 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Avg Response:</span>
                          <span className="text-purple-400">{game.averageResponseTime ? Math.round(game.averageResponseTime) : 0}ms</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}