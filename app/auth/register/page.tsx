'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, UserIcon, AtSymbolIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function CompanyRegister() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyDomain: '',
    adminFullName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'free'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-format company domain
    if (name === 'companyDomain') {
      let formattedValue = value;
      if (!formattedValue.startsWith('@') && formattedValue.length > 0) {
        formattedValue = '@' + formattedValue;
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } 
    // Auto-suggest admin email based on company domain
    else if (name === 'companyDomain' || name === 'adminFullName') {
      setFormData(prev => {
        const updates = { [name]: value };
        
        // Auto-suggest admin email when domain or name changes
        if (name === 'companyDomain' && value && prev.adminFullName) {
          const domain = value.startsWith('@') ? value.slice(1) : value;
          const namePart = prev.adminFullName.toLowerCase().replace(/\s+/g, '.');
          updates.adminEmail = `${namePart}@${domain}`;
        }
        
        return { ...prev, ...updates };
      });
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.companyEmail.includes('@')) {
      setError('Valid company email is required');
      return false;
    }
    if (!formData.companyDomain.startsWith('@') || formData.companyDomain.length < 4) {
      setError('Valid company domain is required (e.g., @yourcompany.com)');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.adminFullName.trim()) {
      setError('Admin full name is required');
      return false;
    }
    if (!formData.adminEmail.includes('@')) {
      setError('Valid admin email is required');
      return false;
    }
    
    // Check if admin email matches company domain
    const adminDomain = '@' + formData.adminEmail.split('@')[1];
    if (adminDomain !== formData.companyDomain) {
      setError(`Admin email must use your company domain ${formData.companyDomain}`);
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep2()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyDomain: formData.companyDomain,
          adminFullName: formData.adminFullName,
          adminEmail: formData.adminEmail,
          password: formData.password,
          subscriptionPlan: formData.subscriptionPlan
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message with next steps
        const companyName = data.company?.name || 'Your Company';
        const companyDomain = data.company?.domain || 'N/A';
        const adminName = data.admin?.full_name || 'Admin User';
        const subscriptionPlan = data.company?.subscription_plan?.toUpperCase() || 'FREE';
        const nextSteps = data.next_steps || ['Login with your credentials'];
        
        alert(`🎉 Company Registration Successful!\n\n` +
              `Company: ${companyName}\n` +
              `Domain: ${companyDomain}\n` +
              `Admin: ${adminName}\n` +
              `Plan: ${subscriptionPlan}\n\n` +
              `Next Steps:\n${nextSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n` +
              `You can now login with your admin credentials!`);
        
        router.push('/auth/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Network error. Please try again.');
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
            Register Your Company
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Create your company account to start hiring with cognitive assessments
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-3">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index + 1 <= step
                    ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Step {step} of 2: {step === 1 ? 'Company Information' : 'Admin Account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 1 ? (
            // Step 1: Company Information
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-slate-300 mb-2">
                  Company Email *
                </label>
                <div className="relative">
                  <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    required
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyDomain" className="block text-sm font-medium text-slate-300 mb-2">
                  Company Email Domain *
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="companyDomain"
                    name="companyDomain"
                    type="text"
                    required
                    value={formData.companyDomain}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@yourcompany.com"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  All admin users must use this domain for their email addresses
                </p>
              </div>

              <div>
                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-slate-300 mb-2">
                  Subscription Plan
                </label>
                <select
                  id="subscriptionPlan"
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free (25 candidates)</option>
                  <option value="premium">Premium (100 candidates)</option>
                  <option value="enterprise">Enterprise (1000 candidates)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue to Admin Setup →
              </button>
            </div>
          ) : (
            // Step 2: Admin Account
            <div className="space-y-4">
              <div>
                <label htmlFor="adminFullName" className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="adminFullName"
                    name="adminFullName"
                    type="text"
                    required
                    value={formData.adminFullName}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Email * <span className="text-slate-500">({formData.companyDomain})</span>
                </label>
                <div className="relative">
                  <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`admin${formData.companyDomain}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="At least 8 characters"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Creating Account...' : '🏢 Create Company Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
        </div>

        {/* Floating animation elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce opacity-25"></div>
        </div>
      </div>
    </div>
  );
}
