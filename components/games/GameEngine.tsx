'use client';

import React from 'react';
import NBackGame from './NBackGame';
import StroopGame from './StroopGame';
import ReactionTimeGame from './ReactionTimeGame';
import PatternGame from './PatternGame';
import LogicGame from './LogicGame';

interface GameConfig {
  timeLimit?: number;
  difficulty?: string;
  n?: number;
  trials?: number;
  stimulusDuration?: number;
  isi?: number;
  targets?: number;
  timer?: number;
  minDelay?: number;
  maxDelay?: number;
  jobRole?: string;
  [key: string]: any;
}

interface GameEngineProps {
  gameCode: string;
  gameConfig: GameConfig;
  onComplete: (results: any[]) => void;
  onProgress?: (progress: number) => void;
}

export default function GameEngine({ gameCode, gameConfig, onComplete, onProgress }: GameEngineProps) {
  // Route to the appropriate game component based on gameCode
  switch (gameCode) {
    case 'NBACK':
      return (
        <NBackGame
          config={{
            n: gameConfig.n || 2,
            trials: gameConfig.trials || 20,
            stimulusDuration: gameConfig.stimulusDuration || 1500,
            isi: gameConfig.isi || 2000,
            targets: gameConfig.targets || 0.3,
            timer: gameConfig.timer || gameConfig.timeLimit || 300,
            jobRole: gameConfig.jobRole
          }}
          onComplete={onComplete}
          onProgress={onProgress || (() => {})}
        />
      );

    case 'STROOP':
      return (
        <StroopGame
          config={{
            timeLimit: gameConfig.timeLimit || 300,
            trials: gameConfig.trials || 20,
            difficulty: gameConfig.difficulty || 'medium',
            jobRole: gameConfig.jobRole
          }}
          onComplete={onComplete}
          onProgress={onProgress || (() => {})}
        />
      );

    case 'REACTION_TIME':
      return (
        <ReactionTimeGame
          config={{
            trials: gameConfig.trials || 20,
            minDelay: gameConfig.minDelay || 500,
            maxDelay: gameConfig.maxDelay || 2000,
            timer: gameConfig.timer || gameConfig.timeLimit || 300,
            jobRole: gameConfig.jobRole
          }}
          onComplete={onComplete}
          onProgress={onProgress || (() => {})}
        />
      );

    case 'PATTERN_RECOGNITION':
      return (
        <PatternGame
          config={{
            timeLimit: gameConfig.timeLimit || 300,
            trials: gameConfig.trials || 15,
            difficulty: gameConfig.difficulty || 'medium',
            jobRole: gameConfig.jobRole
          }}
          onComplete={onComplete}
          onProgress={onProgress || (() => {})}
        />
      );

    case 'LOGICAL_REASONING':
      return (
        <LogicGame
          config={{
            timeLimit: gameConfig.timeLimit || 300,
            trials: gameConfig.trials || 15,
            difficulty: gameConfig.difficulty || 'medium',
            jobRole: gameConfig.jobRole
          }}
          onComplete={onComplete}
          onProgress={onProgress || (() => {})}
        />
      );

    default:
      return (
        <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-lg border border-red-500/30">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Game Not Found</h3>
            <p className="text-slate-400">Game code "{gameCode}" is not supported.</p>
            <p className="text-xs text-slate-500 mt-2">Available games: NBACK, STROOP, REACTION_TIME, PATTERN_RECOGNITION, LOGICAL_REASONING</p>
          </div>
        </div>
      );
  }
}
