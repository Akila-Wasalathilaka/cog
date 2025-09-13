'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/utils/api';

interface LogicGameProps {
  config: {
    timeLimit: number;
    trials?: number;
    jobRole?: string;
    difficulty?: string;
  };
  onComplete: (results: { [key: string]: any }[]) => void;
  onProgress?: (progress: number) => void;
}

interface LogicTrial {
  problem: string;
  options: string[];
  correctAnswer: string;
  category: string;
  explanation: string;
  context: string;
}

interface LogicContent {
  theme: string;
  instructions: string;
  trials: LogicTrial[];
  explanation: string;
}

export default function LogicGame({ config, onComplete, onProgress }: LogicGameProps) {
  const [content, setContent] = useState<LogicContent | null>(null);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalTrials = config.trials || 12;

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      console.log('LogicGame: Starting content generation');
      console.log('LogicGame: Config received:', config);
      
      // For testing, try to get token from multiple sources
      let token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('access_token') ||
                  sessionStorage.getItem('accessToken');
      
      console.log('LogicGame: Token found:', !!token, token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        // Try to get from cookies
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'accessToken' || name === 'access_token') {
            token = value;
            console.log('LogicGame: Token found in cookie:', name);
            break;
          }
        }
      }
      
      const response = await fetch('/api/games/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          gameType: 'logical_reasoning',
          jobRole: config.jobRole || 'General',
          difficulty: config.difficulty || 'medium',
          config: {
            trials: totalTrials
          }
        })
      });

      console.log('LogicGame: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('LogicGame: Response error:', errorText);
        throw new Error(`Failed to generate content: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('LogicGame: Response data keys:', Object.keys(data));
      setContent(data);
      setLoading(false);
    } catch (err) {
      console.error('LogicGame: Error generating content:', err);
      setError(`Failed to load game content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    nextTrial();
  };

  const nextTrial = useCallback(() => {
    if (currentTrial >= totalTrials) {
      endGame();
      return;
    }

    setStartTime(Date.now());
    onProgress?.((currentTrial / totalTrials) * 100);
  }, [currentTrial, totalTrials, onProgress]);

  const handleResponse = (selectedAnswer: string) => {
    if (!content || !gameStarted) return;

    const trial = content.trials[currentTrial];
    const responseTime = Date.now() - startTime;
    const isCorrect = selectedAnswer === trial.correctAnswer;

    setResponses(prev => [...prev, {
      trial: currentTrial,
      problem: trial.problem,
      selectedAnswer,
      correctAnswer: trial.correctAnswer,
      isCorrect,
      responseTime,
      category: trial.category,
      context: trial.context
    }]);

    setCurrentTrial(prev => prev + 1);
  };

  const endGame = () => {
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    const accuracy = (correctResponses / responses.length) * 100;

    // Calculate score considering both accuracy and response time
    let timeScore = 0;
    if (avgResponseTime > 0) {
      // For logical reasoning, moderate timing is ideal
      if (avgResponseTime < 5000) {
        timeScore = 80; // Very fast
      } else if (avgResponseTime < 10000) {
        timeScore = 100; // Ideal timing
      } else if (avgResponseTime < 15000) {
        timeScore = 90; // Good timing
      } else if (avgResponseTime < 20000) {
        timeScore = 75; // Acceptable timing
      } else {
        timeScore = 60; // Too slow
      }
    }

    // Combined score: 70% accuracy, 30% timing
    const finalScore = Math.round((accuracy * 0.7) + (timeScore * 0.3));
    const score = Math.max(0, Math.min(100, finalScore));

    const result = {
      gameType: 'logical_reasoning',
      totalTrials: responses.length,
      completedTrials: responses.length,
      correctTrials: correctResponses,
      accuracy: accuracy,
      averageResponseTime: Math.round(avgResponseTime),
      score: score,
      trials: responses,
      theme: content?.theme,
      completedAt: new Date().toISOString()
    };

    onComplete([result]);
  };

  useEffect(() => {
    if (currentTrial >= totalTrials && responses.length > 0) {
      endGame();
    }
  }, [currentTrial, totalTrials, responses.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating personalized logical reasoning test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <p>{error}</p>
        <button 
          onClick={generateContent}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!content) {
    return <div className="text-center text-slate-400 p-8">No content available</div>;
  }

  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <h3 className="text-2xl font-bold text-white mb-4">{content.theme}</h3>
        
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-indigo-300 mb-3">Why this matters:</h4>
          <p className="text-indigo-100 text-sm">{content.explanation}</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Instructions:</h4>
          <p className="text-slate-300 mb-4">{content.instructions}</p>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
            <p className="text-yellow-100 text-sm">Take your time to analyze each problem carefully. Think step by step through the logic.</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-lg"
        >
          Start Logic Test
        </button>
      </div>
    );
  }

  const trial = content.trials[currentTrial];
  if (!trial) {
    return <div className="text-center text-slate-400 p-8">Loading next problem...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{content.theme}</h3>
          <div className="text-slate-400">Problem {currentTrial + 1} of {totalTrials}</div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
          />
        </div>
      </div>

      {trial.context && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">Context:</h4>
          <p className="text-slate-300">{trial.context}</p>
        </div>
      )}

      <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Problem:</h4>
        <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">{trial.problem}</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-4">Choose the best answer:</h4>
        {trial.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleResponse(option)}
            className="w-full text-left bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
          >
            <span className="font-semibold text-indigo-300 mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
