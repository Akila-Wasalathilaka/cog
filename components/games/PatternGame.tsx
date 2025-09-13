'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/utils/api';

interface PatternGameProps {
  config: {
    timeLimit: number;
    trials?: number;
    jobRole?: string;
    difficulty?: string;
  };
  onComplete: (results: { [key: string]: any }[]) => void;
  onProgress?: (progress: number) => void;
}

interface PatternTrial {
  pattern: string[];
  options: string[];
  correctAnswer: string;
  category: string;
  explanation: string;
}

interface PatternContent {
  theme: string;
  instructions: string;
  trials: PatternTrial[];
  explanation: string;
}

export default function PatternGame({ config, onComplete, onProgress }: PatternGameProps) {
  const [content, setContent] = useState<PatternContent | null>(null);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPattern, setShowPattern] = useState(true);

  const totalTrials = config.trials || 15;

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const response = await fetch('/api/games/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          gameType: 'pattern_recognition',
          jobRole: config.jobRole || 'General',
          difficulty: config.difficulty || 'medium',
          config: {
            trials: totalTrials
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data);
      setLoading(false);
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to load game content');
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

    setShowPattern(true);
    // Show pattern for 3 seconds, then show options
    setTimeout(() => {
      setShowPattern(false);
      setStartTime(Date.now());
    }, 3000);

    onProgress?.((currentTrial / totalTrials) * 100);
  }, [currentTrial, totalTrials, onProgress]);

  const handleResponse = (selectedAnswer: string) => {
    if (!content || !gameStarted || showPattern) return;

    const trial = content.trials[currentTrial];
    const responseTime = Date.now() - startTime;
    const isCorrect = selectedAnswer === trial.correctAnswer;

    setResponses(prev => [...prev, {
      trial: currentTrial,
      pattern: trial.pattern,
      selectedAnswer,
      correctAnswer: trial.correctAnswer,
      isCorrect,
      responseTime,
      category: trial.category
    }]);

    setCurrentTrial(prev => prev + 1);
  };

  const endGame = () => {
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    const accuracy = responses.length > 0 
      ? Math.max(0, Math.min(100, (correctResponses / responses.length) * 100)) 
      : 0;

    // Calculate score considering both accuracy and response time
    let timeScore = 0;
    if (avgResponseTime > 0) {
      // For pattern recognition, moderate timing is ideal
      if (avgResponseTime < 2000) {
        timeScore = 80; // Very fast
      } else if (avgResponseTime < 4000) {
        timeScore = 100; // Ideal timing
      } else if (avgResponseTime < 6000) {
        timeScore = 90; // Good timing
      } else if (avgResponseTime < 8000) {
        timeScore = 75; // Acceptable timing
      } else {
        timeScore = 60; // Too slow
      }
    }

    // Combined score: 70% accuracy, 30% timing
    const finalScore = Math.round((accuracy * 0.7) + (timeScore * 0.3));
    const score = Math.max(0, Math.min(100, finalScore));

    const result = {
      gameType: 'pattern_recognition',
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
          <p className="text-slate-300">Generating personalized pattern recognition test...</p>
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
        
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-3">Why this matters:</h4>
          <p className="text-purple-100 text-sm">{content.explanation}</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Instructions:</h4>
          <p className="text-slate-300 mb-4">{content.instructions}</p>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
            <p className="text-blue-100 text-sm">You&apos;ll see a pattern for 3 seconds, then choose what comes next from the options provided.</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-lg"
        >
          Start Pattern Test
        </button>
      </div>
    );
  }

  const trial = content.trials[currentTrial];
  if (!trial) {
    return <div className="text-center text-slate-400 p-8">Loading next trial...</div>;
  }

  return (
    <div className="text-center p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{content.theme}</h3>
          <div className="text-slate-400">Pattern {currentTrial + 1} of {totalTrials}</div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
          />
        </div>
      </div>

      {showPattern ? (
        <div className="bg-slate-800/50 rounded-lg p-8">
          <h4 className="text-lg font-semibold text-white mb-4">Study this pattern:</h4>
          <div className="bg-white rounded-lg p-8 mb-4">
            <div className="flex justify-center items-center space-x-4 text-2xl font-mono">
              {trial.pattern.map((item, index) => (
                <span key={index} className="text-slate-800 bg-slate-100 p-3 rounded border-2">
                  {item}
                </span>
              ))}
              <span className="text-slate-400 text-3xl">?</span>
            </div>
          </div>
          <div className="text-slate-300">
            <div className="animate-pulse">Memorizing pattern... 3 seconds</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">What comes next in this pattern?</h4>
            <div className="bg-white rounded-lg p-6 mb-4">
              <div className="flex justify-center items-center space-x-4 text-xl font-mono">
                {trial.pattern.map((item, index) => (
                  <span key={index} className="text-slate-800 bg-slate-100 p-2 rounded border">
                    {item}
                  </span>
                ))}
                <span className="text-red-500 text-2xl font-bold">?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trial.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(option)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
