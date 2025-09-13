'use client';

import Link from 'next/link';
import TestimonialsSection from '../components/TestimonialsSection';
import { useState } from 'react';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/50 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between w-full max-w-6xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cognihire
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium">How It Works</a>
              <a href="#games" className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium">Games</a>
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">Login</Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                <div className="flex flex-col space-y-3">
                  <a 
                    href="#features" 
                    className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-800/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#how-it-works" 
                    className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-800/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a 
                    href="#games" 
                    className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-800/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Games
                  </a>
                  <Link 
                    href="/auth/login" 
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-800/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        {/* Cognitive-themed background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Neural network nodes */}
          <div className="absolute top-20 left-1/4 w-3 h-3 bg-blue-400/40 rounded-full animate-neural-pulse"></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-neural-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-40 left-1/2 w-2.5 h-2.5 bg-cyan-400/40 rounded-full animate-neural-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-24 right-1/4 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-neural-pulse" style={{ animationDelay: '3s' }}></div>

          {/* Data flow particles */}
          <div className="absolute top-1/3 left-10 w-1 h-1 bg-blue-300/60 rounded-full animate-data-flow"></div>
          <div className="absolute top-2/3 right-10 w-1 h-1 bg-purple-300/60 rounded-full animate-data-flow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/6 w-0.5 h-0.5 bg-cyan-300/60 rounded-full animate-data-flow" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-indigo-300/60 rounded-full animate-data-flow" style={{ animationDelay: '6s' }}></div>

          {/* Brain wave patterns */}
          <div className="absolute top-16 left-1/3 w-24 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-brain-wave"></div>
          <div className="absolute top-48 right-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-brain-wave" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-36 left-2/3 w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-brain-wave" style={{ animationDelay: '4s' }}></div>

          {/* Synaptic sparks */}
          <div className="absolute top-28 left-1/6 w-1 h-1 bg-yellow-400/50 rounded-full animate-synaptic-spark"></div>
          <div className="absolute top-52 right-1/6 w-1 h-1 bg-orange-400/50 rounded-full animate-synaptic-spark" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-40 left-3/4 w-0.5 h-0.5 bg-red-400/50 rounded-full animate-synaptic-spark" style={{ animationDelay: '3s' }}></div>

          {/* Cognitive flow elements */}
          <div className="absolute top-1/4 right-1/2 w-2 h-2 border border-blue-400/40 rounded-full animate-cognitive-flow"></div>
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 border border-purple-400/40 rounded-full animate-cognitive-flow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 right-1/5 w-1 h-1 border border-cyan-400/40 rounded-full animate-cognitive-flow" style={{ animationDelay: '6s' }}></div>

          {/* Neural connections (lines) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="50%" stopColor="rgba(147, 51, 234, 0.2)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
              </linearGradient>
            </defs>
            <path d="M20,30 Q50,20 80,30" stroke="url(#neuralGradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '8s' }} />
            <path d="M15,50 Q50,40 85,50" stroke="url(#neuralGradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <path d="M25,70 Q50,60 75,70" stroke="url(#neuralGradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          </svg>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Cognitive
              </span>
              <br />
              <span className="text-white">Assessment</span>
              <br />
              <span className="text-slate-300">Revolution</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform human potential evaluation with our advanced AI-powered cognitive assessment platform.
              Measure intelligence, attention, memory, and problem-solving skills through scientifically validated games.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                Start Free Assessment
              </Link>
              <Link
                href="#features"
                className="bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
            <div className="flex justify-center space-x-8 text-sm text-slate-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                7-Day Free Trial
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enterprise Security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Cognihire?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Our platform combines cutting-edge cognitive science with enterprise-grade technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-blue-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-blue-400 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-blue-300 transition-colors duration-300">Scientific Accuracy</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Backed by decades of cognitive research, our assessments provide reliable measurements
                of cognitive abilities with industry-leading accuracy and validity.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-green-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-green-400 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-green-300 transition-colors duration-300">Advanced Analytics</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Comprehensive dashboards with real-time analytics, performance tracking,
                and detailed reports to help you make data-driven decisions.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-purple-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-purple-400 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-purple-300 transition-colors duration-300">Enterprise Security</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Bank-level encryption, JWT authentication, comprehensive audit logging,
                and SOC 2 compliance ensure your data remains secure and private.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-cyan-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-cyan-400 mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-cyan-300 transition-colors duration-300">Lightning Fast</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Optimized for performance with sub-second response times and seamless
                gameplay experience across all devices and network conditions.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-yellow-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="text-yellow-400 mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-yellow-300 transition-colors duration-300">User-Friendly</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Intuitive interface designed for both administrators and candidates,
                with comprehensive support and documentation available 24/7.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-10 rounded-3xl border border-slate-600 hover:border-red-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-red-400 mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-red-300 transition-colors duration-300">Global Scale</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Deployed worldwide with multi-tenant architecture supporting thousands
                of concurrent users and millions of assessments annually.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cognitive Games Library
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Scientifically designed games that measure different aspects of cognitive ability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "N-Back Memory",
                description: "Tests working memory and attention by tracking sequences of stimuli",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                color: "from-blue-500 to-cyan-500",
                delay: "0.1s"
              },
              {
                name: "Stroop Test",
                description: "Measures cognitive flexibility and processing speed through color-word interference",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                ),
                color: "from-purple-500 to-pink-500",
                delay: "0.2s"
              },
              {
                name: "Pattern Recognition",
                description: "Evaluates logical reasoning and pattern identification skills",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "from-green-500 to-teal-500",
                delay: "0.3s"
              },
              {
                name: "Reaction Time",
                description: "Assesses psychomotor speed and alertness through rapid response tasks",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                color: "from-yellow-500 to-orange-500",
                delay: "0.4s"
              },
              {
                name: "Logic Puzzles",
                description: "Tests deductive reasoning and problem-solving abilities",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                color: "from-red-500 to-pink-500",
                delay: "0.5s"
              },
              {
                name: "Attention Training",
                description: "Improves focus and concentration through sustained attention exercises",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                color: "from-indigo-500 to-purple-500",
                delay: "0.6s"
              }
            ].map((game, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-8 rounded-3xl border border-slate-600 hover:border-slate-500 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 animate-fade-in-up" style={{ animationDelay: game.delay }}>
                <div className={`mb-6 bg-gradient-to-r ${game.color} bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500`}>
                  {game.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-slate-200 transition-colors duration-300">{game.name}</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{game.description}</p>
                <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-800/30 relative overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Simple, streamlined process from setup to insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl group-hover:shadow-blue-500/50">
                1
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-blue-300 transition-colors duration-300">Setup Assessment</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Configure custom assessment templates with selected cognitive games,
                set time limits, and define evaluation criteria for your specific needs.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="w-8 h-8 text-blue-400 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-2xl group-hover:shadow-purple-500/50">
                2
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-purple-300 transition-colors duration-300">Invite Candidates</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Send personalized assessment links to candidates. Our platform handles
                authentication, progress tracking, and ensures a smooth testing experience.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="w-8 h-8 text-purple-400 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="bg-gradient-to-r from-pink-600 to-red-600 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl group-hover:shadow-pink-500/50">
                3
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-pink-300 transition-colors duration-300">Get Insights</h3>
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                Receive comprehensive reports with scores, analytics, and recommendations.
                Track performance trends and make data-driven hiring decisions.
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="w-8 h-8 text-pink-400 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-18 h-18 bg-pink-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          {/* Neural connections */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="testimonialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
                <stop offset="50%" stopColor="rgba(147, 51, 234, 0.08)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
              </linearGradient>
            </defs>
            <path d="M10,40 Q30,30 50,40" stroke="url(#testimonialGradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '6s' }} />
            <path d="M60,30 Q80,40 90,30" stroke="url(#testimonialGradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
            <path d="M20,60 Q40,50 60,60" stroke="url(#testimonialGradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              See what organizations say about Cognihire
            </p>
          </div>

          {/* Auto-scrolling testimonials carousel */}
          <div className="relative">
            <div className="flex animate-scroll hover:pause-scroll">
              {/* First set of testimonials */}
              {[
                {
                  quote: "Cognihire transformed our recruitment process. The cognitive assessments provide deeper insights than traditional interviews alone.",
                  author: "Sarah Johnson",
                  role: "HR Director",
                  company: "TechCorp",
                  avatar: "SJ",
                  gradient: "from-blue-500 to-purple-500",
                  rating: 5,
                  delay: "0s"
                },
                {
                  quote: "The analytics dashboard is incredible. We can now identify top performers and predict job success with unprecedented accuracy.",
                  author: "Michael Rodriguez",
                  role: "CEO",
                  company: "InnovateLabs",
                  avatar: "MR",
                  gradient: "from-green-500 to-teal-500",
                  rating: 5,
                  delay: "0.2s"
                },
                {
                  quote: "Security and compliance were our top concerns. Cognihire exceeded our expectations with enterprise-grade protection and detailed audit trails.",
                  author: "Amanda Liu",
                  role: "CTO",
                  company: "SecureTech",
                  avatar: "AL",
                  gradient: "from-purple-500 to-pink-500",
                  rating: 5,
                  delay: "0.4s"
                },
                {
                  quote: "The platform's scalability and multi-tenant architecture perfectly supports our global operations across 50+ countries.",
                  author: "David Chen",
                  role: "VP of Talent",
                  company: "GlobalTech Solutions",
                  avatar: "DC",
                  gradient: "from-cyan-500 to-blue-500",
                  rating: 5,
                  delay: "0.6s"
                },
                {
                  quote: "Implementation was seamless and our candidates love the engaging game-based assessments. Response rates increased by 300%.",
                  author: "Rachel Thompson",
                  role: "Head of Assessment",
                  company: "FutureWorks Inc",
                  avatar: "RT",
                  gradient: "from-orange-500 to-red-500",
                  rating: 5,
                  delay: "0.8s"
                }
              ].map((testimonial, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 w-96 mx-4 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group animate-fade-in-up"
                  style={{ animationDelay: testimonial.delay }}
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 animate-pulse group-hover:animate-glow"
                        style={{ animationDelay: `${i * 100}ms` }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:animate-glow`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-blue-300 transition-colors duration-300">
                        {testimonial.author}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Duplicate set for seamless loop */}
              {[
                {
                  quote: "Cognihire transformed our recruitment process. The cognitive assessments provide deeper insights than traditional interviews alone.",
                  author: "Sarah Johnson",
                  role: "HR Director",
                  company: "TechCorp",
                  avatar: "SJ",
                  gradient: "from-blue-500 to-purple-500",
                  rating: 5,
                  delay: "0s"
                },
                {
                  quote: "The analytics dashboard is incredible. We can now identify top performers and predict job success with unprecedented accuracy.",
                  author: "Michael Rodriguez",
                  role: "CEO",
                  company: "InnovateLabs",
                  avatar: "MR",
                  gradient: "from-green-500 to-teal-500",
                  rating: 5,
                  delay: "0.2s"
                },
                {
                  quote: "Security and compliance were our top concerns. Cognihire exceeded our expectations with enterprise-grade protection and detailed audit trails.",
                  author: "Amanda Liu",
                  role: "CTO",
                  company: "SecureTech",
                  avatar: "AL",
                  gradient: "from-purple-500 to-pink-500",
                  rating: 5,
                  delay: "0.4s"
                },
                {
                  quote: "The platform's scalability and multi-tenant architecture perfectly supports our global operations across 50+ countries.",
                  author: "David Chen",
                  role: "VP of Talent",
                  company: "GlobalTech Solutions",
                  avatar: "DC",
                  gradient: "from-cyan-500 to-blue-500",
                  rating: 5,
                  delay: "0.6s"
                },
                {
                  quote: "Implementation was seamless and our candidates love the engaging game-based assessments. Response rates increased by 300%.",
                  author: "Rachel Thompson",
                  role: "Head of Assessment",
                  company: "FutureWorks Inc",
                  avatar: "RT",
                  gradient: "from-orange-500 to-red-500",
                  rating: 5,
                  delay: "0.8s"
                }
              ].map((testimonial, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 w-96 mx-4 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group animate-fade-in-up"
                  style={{ animationDelay: testimonial.delay }}
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 animate-pulse group-hover:animate-glow"
                        style={{ animationDelay: `${i * 100}ms` }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:animate-glow`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-blue-300 transition-colors duration-300">
                        {testimonial.author}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced navigation dots with animations */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                className="w-3 h-3 rounded-full bg-slate-600 hover:bg-blue-400 transition-all duration-300 hover:scale-125 hover:shadow-lg hover:shadow-blue-400/50 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Assessment Process?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of organizations already using Cognihire to make better hiring decisions
              and unlock human potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 hover:rotate-1 animate-pulse"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-4 px-12 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
            <div className="flex justify-center space-x-8 text-sm text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                7-Day Free Trial
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enterprise Security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900/20 backdrop-blur-xl border-t border-slate-700/50 relative overflow-hidden rounded-t-3xl">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in-up col-span-1 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 lg:mb-6">
                Cognihire
              </div>
              <p className="text-slate-400 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
                Advanced cognitive assessment platform for evaluating human intelligence and potential.
              </p>
              <div className="flex space-x-3 lg:space-x-4">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">Product</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Features</a></li>
                <li><a href="#games" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Games</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">How It Works</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Pricing</a></li>
              </ul>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">Company</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Contact</a></li>
              </ul>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">Support</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">API Docs</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm lg:text-base">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 lg:pt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-slate-400 text-sm lg:text-base">
              © 2025 Cognihire. All rights reserved. Built with ❤️ for cognitive excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}