'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthHeaders } from '@/utils/api';

interface StroopTrial {
  word: string;
  color: string;
  response?: string;
  responseTime?: number;
  correct?: boolean;
}

interface StroopGameProps {
  config: {
    timeLimit?: number;
    trials?: number;
    difficulty?: string;
    jobRole?: string;
  };
  onComplete: (results: any) => void;
  onProgress?: (progress: number) => void;
}

const StroopGame: React.FC<StroopGameProps> = ({ config, onComplete, onProgress }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Color mapping for consistent comparison
  const colorMap = {
    '#FF0000': 'RED',
    '#0000FF': 'BLUE',
    '#00FF00': 'GREEN',
    '#FFFF00': 'YELLOW',
    '#FFA500': 'ORANGE',
    '#800080': 'PURPLE'
  };

  const reverseColorMap = {
    'RED': '#FF0000',
    'BLUE': '#0000FF',
    'GREEN': '#00FF00',
    'YELLOW': '#FFFF00',
    'ORANGE': '#FFA500',
    'PURPLE': '#800080'
  };

  // Generate trials with Mistral AI content
  const generateTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add randomization for repeat attempts
      const randomSeed = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();

      const response = await fetch('/api/games/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          gameType: 'stroop',
          jobRole: config.jobRole || 'General',
          difficulty: config.difficulty || 'medium',
          config: {
            trials: config.trials || 20,
            randomSeed: randomSeed,
            timestamp: timestamp,
            sessionId: `stroop_${timestamp}_${randomSeed}`
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate game content');
      }

      const data = await response.json();
      const generatedTrials: StroopTrial[] = data.trials || [];

      if (generatedTrials.length === 0) {
        // Fallback to default content if API fails
        const defaultTrials = generateDefaultTrials();
        setTrials(defaultTrials);
      } else {
        setTrials(generatedTrials);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error generating trials:', err);
      setError('Failed to load game content');
      // Use fallback content
      const defaultTrials = generateDefaultTrials();
      setTrials(defaultTrials);
      setLoading(false);
    }
  }, [config.jobRole, config.difficulty, config.trials]);

  const generateDefaultTrials = useCallback((): StroopTrial[] => {
    const colorOptions = [
      { name: 'RED', color: '#FF0000' },
      { name: 'BLUE', color: '#0000FF' },
      { name: 'GREEN', color: '#00FF00' },
      { name: 'YELLOW', color: '#FFFF00' },
      { name: 'ORANGE', color: '#FFA500' },
      { name: 'PURPLE', color: '#800080' }
    ];

    const trials: StroopTrial[] = [];
    const timestamp = Date.now();
    const randomSeed = Math.random();

    for (let i = 0; i < (config.trials || 20); i++) {
      // Add timestamp and random seed to make each attempt unique
      const seed1 = (timestamp + i * 1000 + randomSeed * 10000) % colorOptions.length;
      const seed2 = (timestamp + i * 2000 + randomSeed * 20000) % colorOptions.length;

      let wordIndex = Math.floor(seed1);
      let colorIndex = Math.floor(seed2);

      // Ensure word and color are different for Stroop effect
      if (wordIndex === colorIndex) {
        colorIndex = (colorIndex + 1) % colorOptions.length;
      }

      // Additional randomization for more unpredictability
      if (Math.random() > 0.5) {
        const temp = wordIndex;
        wordIndex = colorIndex;
        colorIndex = temp;
      }

      trials.push({
        word: colorOptions[wordIndex].name,
        color: colorOptions[colorIndex].color
      });
    }

    // Shuffle the trials array for additional randomness
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }

    return trials;
  }, [config.trials]);

  useEffect(() => {
    generateTrials();
  }, [generateTrials]);

  // Timer effect - separate from timeLeft dependency to prevent flickering
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            endGame();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameStarted]); // Removed timeLeft from dependencies

  // Separate effect to handle time up
  useEffect(() => {
    if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted]);

  const startGame = () => {
    if (trials.length === 0) return;
    
    setGameStarted(true);
    setCurrentTrial(0);
    presentTrial(0);
  };

  const presentTrial = (trialIndex: number) => {
    if (trialIndex >= trials.length) {
      endGame();
      return;
    }

    setWaitingForResponse(true);
    setStartTime(Date.now());
    
    onProgress?.(((trialIndex + 1) / trials.length) * 100);
  };

  const handleResponse = useCallback((response: string) => {
    if (!waitingForResponse) return;

    const responseTime = Date.now() - startTime;
    const trial = trials[currentTrial];
    const correct = response === trial.color;

    setTrials(prevTrials => {
      const updatedTrials = [...prevTrials];
      updatedTrials[currentTrial] = {
        ...trial,
        response,
        responseTime,
        correct
      };
      return updatedTrials;
    });

    setWaitingForResponse(false);

    // Move to next trial after brief delay
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      if (nextTrial < trials.length) {
        setCurrentTrial(nextTrial);
        presentTrial(nextTrial);
      } else {
        endGame();
      }
    }, 500);
  }, [waitingForResponse, startTime, currentTrial, trials]);

  const endGame = () => {
    setGameStarted(false);
    setWaitingForResponse(false);

    // Calculate results
    const completedTrials = trials.filter(t => t.response !== undefined);
    const correctTrials = completedTrials.filter(t => t.correct);
    const averageResponseTime = completedTrials.length > 0
      ? completedTrials.reduce((sum, t) => sum + (t.responseTime || 0), 0) / completedTrials.length
      : 0;

    const accuracy = completedTrials.length > 0 
      ? Math.max(0, Math.min(100, (correctTrials.length / completedTrials.length) * 100)) 
      : 0;

    // Calculate score considering both accuracy and response time
    let timeScore = 0;
    if (averageResponseTime > 0) {
      // For Stroop test, ideal response time is around 800-1200ms
      // Too fast might indicate random guessing, too slow indicates difficulty
      if (averageResponseTime < 500) {
        timeScore = 60; // Penalty for too fast (might be guessing)
      } else if (averageResponseTime < 800) {
        timeScore = 90; // Good timing
      } else if (averageResponseTime < 1200) {
        timeScore = 100; // Ideal timing
      } else if (averageResponseTime < 1500) {
        timeScore = 85; // Acceptable timing
      } else {
        timeScore = 60; // Too slow
      }
    }

    // Combined score: 60% accuracy, 40% timing
    const finalScore = Math.round((accuracy * 0.6) + (timeScore * 0.4));
    const score = Math.max(0, Math.min(100, finalScore));

    const results = {
      gameType: 'stroop',
      totalTrials: trials.length,
      completedTrials: completedTrials.length,
      correctTrials: correctTrials.length,
      accuracy: accuracy,
      averageResponseTime: Math.round(averageResponseTime),
      score: score,
      trials: trials
    };

    onComplete([results]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
        <p className="text-lg">Loading Stroop Test...</p>
        <p className="text-sm text-gray-300 mt-2">Generating attention challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white p-8 rounded-lg">
        <div className="w-16 h-16 bg-red-700/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Game Loading Error</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={generateTrials}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Stroop Color-Word Test</h2>
          <p className="text-lg text-indigo-200 mb-6">
            Test your attention and cognitive flexibility by identifying the color of words, not what they say.
          </p>
          
          <div className="bg-black/20 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Instructions:</h3>
            <ul className="text-left space-y-2 text-indigo-200">
              <li>• You will see color words displayed in different colors</li>
              <li>• Click the button that matches the COLOR of the text, not the word itself</li>
              <li>• For example: if you see &quot;RED&quot; in blue color, click &quot;BLUE&quot;</li>
              <li>• Respond as quickly and accurately as possible</li>
              <li>• Total trials: {trials.length}</li>
              <li>• Time limit: {formatTime(timeLeft)}</li>
            </ul>
          </div>
        </div>

        <button
          onClick={startGame}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Start Stroop Test
        </button>
      </div>
    );
  }

  const currentTrialData = trials[currentTrial];
  if (!currentTrialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
        <p className="text-lg">Loading trial...</p>
      </div>
    );
  }

  // Debug logging for color display
  console.log('Stroop Trial:', currentTrial + 1, 'Word:', currentTrialData.word, 'Color:', currentTrialData.color);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8 rounded-lg">
      {/* Header with progress and timer */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">
            Trial {currentTrial + 1} of {trials.length}
          </span>
          <span className="text-lg font-mono bg-black/20 px-3 py-1 rounded">
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <div className="w-full bg-black/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentTrial + 1) / trials.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main stimulus */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <p className="text-lg text-indigo-200 mb-4">What COLOR is this word?</p>
          <div 
            className="text-8xl font-bold mb-8 transition-all duration-200 select-none"
            style={{ 
              color: currentTrialData.color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              filter: 'brightness(1.2) contrast(1.1)'
            }}
          >
            {currentTrialData.word}
          </div>
        </div>
      </div>

      {/* Response buttons */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
        {[
          { name: 'RED', color: '#FF0000', bg: 'bg-red-600', hover: 'hover:bg-red-700' },
          { name: 'BLUE', color: '#0000FF', bg: 'bg-blue-600', hover: 'hover:bg-blue-700' },
          { name: 'GREEN', color: '#00FF00', bg: 'bg-green-600', hover: 'hover:bg-green-700' },
          { name: 'YELLOW', color: '#FFFF00', bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700' },
          { name: 'ORANGE', color: '#FFA500', bg: 'bg-orange-600', hover: 'hover:bg-orange-700' },
          { name: 'PURPLE', color: '#800080', bg: 'bg-purple-600', hover: 'hover:bg-purple-700' }
        ].map((color) => (
          <button
            key={color.name}
            onClick={() => handleResponse(color.name)}
            disabled={!waitingForResponse}
            className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-transparent ${
              waitingForResponse
                ? `${color.bg} ${color.hover} text-white hover:border-white/30`
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {color.name}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {!waitingForResponse && (
        <div className="mt-6 text-center">
          <p className="text-indigo-200">
            Moving to next trial...
          </p>
        </div>
      )}
    </div>
  );
};

export default StroopGame;
