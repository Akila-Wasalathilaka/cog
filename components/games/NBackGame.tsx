import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/utils/api';

interface NBackConfig {
  n: number;
  trials: number;
  stimulusDuration: number;
  isi: number;
  targets: number;
  timer: number;
  jobRole?: string;
}

interface NBackTrial {
  stimulus: string;
  isTarget: boolean;
  response?: boolean;
  responseTime?: number;
  correct?: boolean;
}

interface NBackProps {
  config: NBackConfig;
  onComplete: (results: { [key: string]: any }[]) => void;
  onProgress: (progress: number) => void;
}

interface DynamicGameContent {
  game_type: string;
  theme: string;
  n_level: number;
  trials_count: number;
  stimuli_set: string[];
  trials: Array<{
    stimulus: string;
    is_target: boolean;
    position: number;
    n_level: number;
  }>;
  instructions: string;
  job_relevance: string;
}

// Fallback stimuli if API fails
const fallbackStimuli = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function NBackGame({ config, onComplete, onProgress }: NBackProps) {
  const [trials, setTrials] = useState<NBackTrial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showStimulus, setShowStimulus] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameContent, setGameContent] = useState<DynamicGameContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('Letters');

  // Fetch dynamic game content on component mount
  useEffect(() => {
    fetchGameContent();
  }, [config.jobRole]);

  const fetchGameContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          gameType: 'n_back',
          jobRole: config.jobRole || 'General',
          difficulty: config.n >= 3 ? 'hard' : config.n >= 2 ? 'medium' : 'easy',
          config: {
            trials: config.trials,
            n_level: config.n
          }
        })
      });

      if (response.ok) {
        const content = await response.json();
        setGameContent(content);
        setTheme(content.theme || 'Letters');
        console.log(`🎯 Loaded ${content.theme} for ${config.jobRole || 'General'} role`);
      } else {
        console.warn('Failed to fetch dynamic content, using fallback');
        generateFallbackContent();
      }
    } catch (error) {
      console.error('Error fetching game content:', error);
      generateFallbackContent();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackContent = () => {
    // Generate fallback content using original logic
    const fallbackTrials = [];
    const targetCount = Math.floor(config.trials * config.targets);

    for (let i = 0; i < config.trials; i++) {
      const stimulus = fallbackStimuli[Math.floor(Math.random() * fallbackStimuli.length)];
      let isTarget = false;

      if (i >= config.n) {
        isTarget = stimulus === fallbackTrials[i - config.n].stimulus;
      }

      fallbackTrials.push({ stimulus, is_target: isTarget, position: i, n_level: config.n });
    }

    setGameContent({
      game_type: 'n_back',
      theme: 'Letters',
      n_level: config.n,
      trials_count: config.trials,
      stimuli_set: fallbackStimuli,
      trials: fallbackTrials,
      instructions: `Press YES when you see the same letter that appeared ${config.n} positions back.`,
      job_relevance: 'Working memory is important for cognitive performance.'
    });
  };

  const generateTrials = useCallback(() => {
    if (!gameContent) return [];
    
    // Convert API format to component format
    return gameContent.trials.map(trial => ({
      stimulus: trial.stimulus,
      isTarget: trial.is_target
    }));
  }, [gameContent]);

  const startGame = useCallback(() => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setCurrentTrial(0);
    setIsActive(true);
    setStartTime(Date.now());
    presentNextStimulus(newTrials, 0);
  }, [generateTrials]);

  const presentNextStimulus = useCallback((trialList: NBackTrial[], trialIndex: number) => {
    if (trialIndex >= trialList.length) {
      setIsActive(false);

      // Calculate final results with score
      const completedTrials = trialList.filter(t => t.response !== undefined);
      const correctTrials = completedTrials.filter(t => t.correct);
      const averageResponseTime = completedTrials.length > 0
        ? completedTrials.reduce((sum, t) => sum + (t.responseTime || 0), 0) / completedTrials.length
        : 0;

      const accuracy = completedTrials.length > 0 
        ? Math.max(0, Math.min(100, (correctTrials.length / completedTrials.length) * 100)) 
        : 0;

      // Calculate score considering accuracy and response time
      let timeScore = 0;
      if (averageResponseTime > 0) {
        // For N-Back, response time should be reasonable (not too fast or slow)
        if (averageResponseTime < 300) {
          timeScore = 70; // Penalty for too fast responses
        } else if (averageResponseTime < 800) {
          timeScore = 100; // Good timing
        } else if (averageResponseTime < 1200) {
          timeScore = 90; // Acceptable timing
        } else if (averageResponseTime < 1500) {
          timeScore = 75; // Slow but acceptable
        } else {
          timeScore = 50; // Too slow
        }
      }

      // Combined score: 70% accuracy, 30% timing
      const finalScore = Math.round((accuracy * 0.7) + (timeScore * 0.3));
      const score = Math.max(0, Math.min(100, finalScore));

      const results = {
        gameType: 'n_back',
        totalTrials: trialList.length,
        completedTrials: completedTrials.length,
        correctTrials: correctTrials.length,
        accuracy: accuracy,
        averageResponseTime: Math.round(averageResponseTime),
        score: score,
        trials: trialList
      };

      onComplete([results]);
      return;
    }

    setCurrentTrial(trialIndex);
    setCurrentStimulus(trialList[trialIndex].stimulus);
    setShowStimulus(true);
    setWaitingForResponse(true);

    onProgress((trialIndex + 1) / trialList.length);

    setTimeout(() => {
      setShowStimulus(false);

      setTimeout(() => {
        presentNextStimulus(trialList, trialIndex + 1);
      }, config.isi - config.stimulusDuration);
    }, config.stimulusDuration);
  }, [config, onComplete, onProgress]);

  const handleResponse = useCallback((response: boolean) => {
    if (!waitingForResponse) return;

    const responseTime = Date.now() - startTime;
    const trial = trials[currentTrial];
    const correct = (response && trial.isTarget) || (!response && !trial.isTarget);

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      response,
      responseTime,
      correct
    };

    setTrials(updatedTrials);
    setWaitingForResponse(false);
  }, [waitingForResponse, trials, currentTrial, startTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!isActive) {
          startGame();
        } else if (waitingForResponse) {
          handleResponse(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, waitingForResponse, startGame, handleResponse]);

  const accuracy = trials.length > 0
    ? Math.max(0, Math.min(100, (trials.filter(t => t.correct).length / trials.length) * 100))
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Personalized Test</h2>
          <p className="text-gray-600">
            Creating cognitive challenges tailored for {config.jobRole || 'your'} role...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {gameContent?.theme || 'N-Back'} Memory Task
          </h2>
          <p className="text-gray-600 mb-4">
            {gameContent?.instructions || `Press SPACE when you see a letter that matches the one ${config.n} positions back.`}
          </p>
          {gameContent?.job_relevance && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Why this matters:</strong> {gameContent.job_relevance}
              </p>
            </div>
          )}
        </div>

        {!isActive ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-4xl font-mono bg-gray-200 rounded p-8 mb-4">
                {currentStimulus || '?'}
              </div>
              <p className="text-sm text-gray-500">
                Press SPACE to {trials.length === 0 ? 'start' : 'continue'}
              </p>
            </div>

            {trials.length > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Progress:</strong> {currentTrial + 1}/{config.trials}
                </div>
                <div>
                  <strong>Accuracy:</strong> {Math.round(accuracy * 100)}%
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl font-mono bg-blue-100 rounded-lg p-12 mb-6 flex items-center justify-center min-h-[200px]">
              {showStimulus ? (
                <span className="text-blue-800 font-bold">{currentStimulus}</span>
              ) : (
                <span className="text-gray-400">+</span>
              )}
            </div>

            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentTrial + 1) / config.trials) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Trial {currentTrial + 1} of {config.trials}
              </p>
            </div>

            {waitingForResponse && (
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600 mb-4">
                  Is this a match? Press SPACE for YES
                </p>
                <button
                  onClick={() => handleResponse(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg mr-4 hover:bg-blue-700"
                >
                  YES (Match)
                </button>
                <button
                  onClick={() => handleResponse(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  NO (No Match)
                </button>
              </div>
            )}
          </div>
        )}
        
        {gameContent && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🎯 Customized for {config.jobRole || 'General'} • {gameContent.theme} Theme • {config.n}-Back Level
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
