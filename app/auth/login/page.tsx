'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, AtSymbolIcon } from '@heroicons/react/24/outline';

export default function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use Next.js API route to handle login for both candidates and admins
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the access token in localStorage and as a cookie
      localStorage.setItem('access_token', data.access_token);
      document.cookie = `accessToken=${data.access_token}; path=/; max-age=86400; samesite=lax; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''}`;
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company));
      }

      // Show welcome message based on available data
      const companyName = data.company?.name || data.user?.company_name || 'Your Company';
      const userName = data.user?.full_name || data.user?.username || 'User';
      const userRole = data.user?.role?.toUpperCase();
      const roleMessage = userRole === 'ADMIN' 
        ? 'Ready to manage your cognitive assessments!'
        : 'Ready to take your cognitive assessment!';
      alert(`🎉 Welcome back to CogniHire!\n\n` +
            `Company: ${companyName}\n` +
            `User: ${userName}\n` +
            `Role: ${data.user.role}\n\n` +
            `${roleMessage}`);

      // Redirect based on role
      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'CANDIDATE') {
        router.push('/candidate/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-600 shadow-2xl">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Company Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access your company&apos;s cognitive assessment platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address or Username
              </label>
              <div className="relative">
                <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@company.com or username"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                You can sign in with either your email address or username
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                '🏢 Sign In to Company Account'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="text-blue-500 hover:text-blue-400">
                Forgot your password?
              </Link>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have a company account?{' '}
            <Link href="/auth/register" className="text-blue-500 hover:text-blue-400 font-medium">
              Register your company
            </Link>
          </p>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="text-center text-xs text-slate-500">
            🧠 Powered by CogniHire - Advanced Cognitive Assessment Platform
          </p>
        </div>

        {/* Floating animation elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce opacity-25"></div>
        </div>
        </div>
      </div>
    </div>
  );
}