'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameEngine from '@/components/games/GameEngine';

interface Assessment {
  id: string;
  candidate_id: string;
  job_role_id: string;
  job_role_title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  cognitive_games: CognitiveGame[];
  started_at?: string;
  completed_at?: string;
  total_score?: number;
  progress_percentage: number;
}

interface CognitiveGame {
  id: string;
  game_id: string;
  type: string;
  title: string;
  description: string;
  time_limit: number;
  order_index: number;
  status: string;
}

interface AntiCheatFlags {
  tab_switches: number;
  window_blur_count: number;
  fullscreen_exit_count: number;
  suspicious_activity: boolean;
  start_time: string;
  last_activity: string;
  copy_paste_attempts: number;
  dev_tools_opened: boolean;
  multiple_windows_detected: boolean;
  unusual_mouse_pattern: boolean;
  rapid_key_presses: number;
  external_apps_focused: boolean;
  network_disconnections: number;
  suspicious_timing: boolean;
  mouse_movements: number;
  keyboard_activity: number;
  last_mouse_move: number;
  last_key_press: number;
  focus_loss_duration: number;
  total_focus_loss_time: number;
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(1500); // 25 minutes total
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real-time activity tracking
  const [lastActivityUpdate, setLastActivityUpdate] = useState(Date.now());
  const [forceUpdate, setForceUpdate] = useState(0);

  // Anti-cheat tracking
  const [antiCheatFlags, setAntiCheatFlags] = useState<AntiCheatFlags>({
    tab_switches: 0,
    window_blur_count: 0,
    fullscreen_exit_count: 0,
    suspicious_activity: false,
    start_time: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    copy_paste_attempts: 0,
    dev_tools_opened: false,
    multiple_windows_detected: false,
    unusual_mouse_pattern: false,
    rapid_key_presses: 0,
    external_apps_focused: false,
    network_disconnections: 0,
    suspicious_timing: false,
    mouse_movements: 0,
    keyboard_activity: 0,
    last_mouse_move: Date.now(),
    last_key_press: Date.now(),
    focus_loss_duration: 0,
    total_focus_loss_time: 0
  });

  // Game results tracking
  const [gameResults, setGameResults] = useState<{[gameId: string]: any}>({});
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showGameResults, setShowGameResults] = useState(false);
  const [currentGameResult, setCurrentGameResult] = useState<any>(null);
  const [assessmentStartTime, setAssessmentStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);

  useEffect(() => {
    fetchAssessment();
    setupAntiCheat();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('beforeunload', () => {});

      // Clean up developer tools check interval
      if ((window as any).antiCheatCleanup) {
        (window as any).antiCheatCleanup();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setTotalTimeLeft((time) => time - 1);
        updateLastActivity();
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Auto-move to next game when time runs out
      handleNextGame();
    } else if (totalTimeLeft === 0) {
      // Force submit when total time is up
      handleSubmitAssessment();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, totalTimeLeft]);

  // Real-time anti-cheat monitoring
  useEffect(() => {
    if (!isActive) return;

    const monitoringInterval = setInterval(() => {
      const now = Date.now();

      setAntiCheatFlags(prev => {
        const timeSinceLastMouse = now - prev.last_mouse_move;
        const timeSinceLastKey = now - prev.last_key_press;
        const isInactive = timeSinceLastMouse > 60000 && timeSinceLastKey > 60000; // 60 seconds of inactivity

        // More intelligent pattern detection
        const unusualPatterns =
          (prev.mouse_movements < 5 && prev.keyboard_activity > 50) || // Very little mouse movement but lots of keyboard activity
          (prev.total_focus_loss_time > 300000) || // More than 5 minutes total focus loss
          (prev.rapid_key_presses > 15) || // More rapid key presses
          (prev.tab_switches >= 3) || // Multiple tab switches
          (prev.window_blur_count >= 5); // Multiple window blurs

        // Check for suspicious timing patterns
        const suspiciousTiming =
          prev.focus_loss_duration > 10000 || // Single focus loss longer than 10 seconds
          (prev.mouse_movements === 0 && prev.keyboard_activity > 20); // No mouse movement but keyboard activity

        // Update suspicious activity based on current thresholds
        const newSuspiciousActivity =
          prev.suspicious_activity ||
          isInactive ||
          unusualPatterns ||
          suspiciousTiming ||
          prev.dev_tools_opened ||
          prev.multiple_windows_detected ||
          prev.network_disconnections >= 2;

        // Debug logging with more detailed information
        if (newSuspiciousActivity !== prev.suspicious_activity) {
          console.log('Anti-cheat: Suspicious activity detected', {
            inactivity: isInactive,
            unusual_patterns: unusualPatterns,
            suspicious_timing: suspiciousTiming,
            tab_switches: prev.tab_switches,
            window_blur: prev.window_blur_count,
            rapid_keys: prev.rapid_key_presses,
            focus_loss_time: prev.total_focus_loss_time,
            dev_tools: prev.dev_tools_opened,
            multiple_windows: prev.multiple_windows_detected,
            network: prev.network_disconnections
          });
        }

        return {
          ...prev,
          suspicious_activity: newSuspiciousActivity,
          unusual_mouse_pattern: unusualPatterns,
          suspicious_timing: suspiciousTiming
        };
      });
    }, 2000); // Check every 2 seconds for better responsiveness

    return () => clearInterval(monitoringInterval);
  }, [isActive]);

  const getTimeSinceLastActivity = () => {
    return Math.floor((Date.now() - new Date(antiCheatFlags.last_activity).getTime()) / 1000);
  };

  const setupAntiCheat = () => {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      setAntiCheatFlags(prev => ({
        ...prev,
        suspicious_activity: true
      }));
    });

    // Detect tab/window switching with more precision
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Detect fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Enhanced keyboard monitoring
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);

    // Mouse activity monitoring
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);

    // Detect multiple windows/tabs
    window.addEventListener('storage', handleStorageChange);

    // Network monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Detect developer tools
    const devToolsCheck = setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        console.log('Anti-cheat: Developer tools detected');
        setAntiCheatFlags(prev => ({
          ...prev,
          dev_tools_opened: true,
          suspicious_activity: true
        }));
      }
    }, 1000); // Check every 1 second for more responsive detection

    // Store cleanup function
    (window as any).antiCheatCleanup = () => clearInterval(devToolsCheck);

    // Prevent page unload during active assessment
    window.addEventListener('beforeunload', (e) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = 'Assessment in progress. Are you sure you want to leave?';
      }
    });
  };

  const handleVisibilityChange = () => {
    if (isActive) {
      const now = Date.now();
      if (document.hidden) {
        console.log('Anti-cheat: Tab switched away');
        setAntiCheatFlags(prev => ({
          ...prev,
          tab_switches: prev.tab_switches + 1,
          suspicious_activity: prev.tab_switches >= 1, // Trigger on first switch
          focus_loss_duration: now
        }));
      } else {
        // Tab became visible again
        console.log('Anti-cheat: Tab switched back');
        setAntiCheatFlags(prev => {
          const focusLossTime = now - (prev.focus_loss_duration || now);
          return {
            ...prev,
            total_focus_loss_time: prev.total_focus_loss_time + focusLossTime,
            suspicious_activity: prev.suspicious_activity || focusLossTime > 30000 // 30 seconds
          };
        });
      }
    }
  };

  const handleWindowBlur = () => {
    if (isActive) {
      setAntiCheatFlags(prev => ({
        ...prev,
        window_blur_count: prev.window_blur_count + 1,
        suspicious_activity: prev.window_blur_count >= 3,
        external_apps_focused: true
      }));
    }
  };

  const handleWindowFocus = () => {
    updateLastActivity();
    if (isActive) {
      setAntiCheatFlags(prev => ({
        ...prev,
        external_apps_focused: false
      }));
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && isActive) {
      console.log('Anti-cheat: Exited fullscreen mode');
      setAntiCheatFlags(prev => ({
        ...prev,
        fullscreen_exit_count: prev.fullscreen_exit_count + 1,
        suspicious_activity: true // Any fullscreen exit is suspicious
      }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Track legitimate game input vs suspicious shortcuts
    const isGameInput = ['Space', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'].includes(e.code);

    // Disable common shortcuts that could be used to cheat
    if (
      e.key === 'F12' || // Dev tools
      (e.ctrlKey && e.shiftKey && e.key === 'I') || // Dev tools
      (e.ctrlKey && e.shiftKey && e.key === 'C') || // Element inspector
      (e.ctrlKey && e.key === 'u') || // View source
      (e.altKey && e.key === 'Tab') || // Alt+Tab
      (e.ctrlKey && e.key === 'Tab') || // Ctrl+Tab
      (e.ctrlKey && e.key === 'n') || // New window
      (e.ctrlKey && e.key === 't') || // New tab
      (e.ctrlKey && e.key === 'w') || // Close tab
      (e.ctrlKey && e.key === 'r') || // Refresh
      (e.ctrlKey && e.key === 'f') || // Find
      (e.ctrlKey && e.key === 'h') || // History
      (e.altKey && e.key === 'F4') // Close window
    ) {
      e.preventDefault();
      setAntiCheatFlags(prev => ({
        ...prev,
        suspicious_activity: true,
        dev_tools_opened: e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')
      }));
      return;
    }

    // Only track rapid key presses for non-game input
    if (isActive && !isGameInput) {
      const now = Date.now();
      setAntiCheatFlags(prev => {
        const timeSinceLastKey = now - prev.last_key_press;
        const isRapid = timeSinceLastKey < 50; // Less than 50ms between key presses
        return {
          ...prev,
          rapid_key_presses: isRapid ? prev.rapid_key_presses + 1 : prev.rapid_key_presses,
          suspicious_activity: prev.suspicious_activity || prev.rapid_key_presses >= 10
        };
      });
    }
  };

  const updateLastActivity = () => {
    setAntiCheatFlags(prev => ({
      ...prev,
      last_activity: new Date().toISOString()
    }));
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    // Only track keyboard activity for non-game input
    const isGameInput = ['Space', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'].includes(e.code);

    if (isActive && !isGameInput) {
      setAntiCheatFlags(prev => ({
        ...prev,
        keyboard_activity: prev.keyboard_activity + 1,
        last_key_press: Date.now()
      }));
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (isActive) {
      e.preventDefault();
      console.log('Anti-cheat: Paste attempt blocked');
      setAntiCheatFlags(prev => ({
        ...prev,
        copy_paste_attempts: prev.copy_paste_attempts + 1,
        suspicious_activity: prev.copy_paste_attempts >= 1 // Trigger on first attempt
      }));
    }
  };

  const handleCopy = (e: ClipboardEvent) => {
    if (isActive) {
      e.preventDefault();
      console.log('Anti-cheat: Copy attempt blocked');
      setAntiCheatFlags(prev => ({
        ...prev,
        copy_paste_attempts: prev.copy_paste_attempts + 1,
        suspicious_activity: prev.copy_paste_attempts >= 1 // Trigger on first attempt
      }));
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isActive) {
      // Only count significant mouse movements (not micro-movements)
      const now = Date.now();
      setAntiCheatFlags(prev => {
        const timeSinceLastMove = now - prev.last_mouse_move;
        // Only count as activity if it's been more than 100ms since last movement
        // This prevents counting micro-movements from mouse jitter
        if (timeSinceLastMove > 100) {
          return {
            ...prev,
            mouse_movements: prev.mouse_movements + 1,
            last_mouse_move: now
          };
        }
        return prev;
      });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isActive) {
      updateLastActivity();
    }
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (isActive && e.key?.includes('assessment')) {
      setAntiCheatFlags(prev => ({
        ...prev,
        multiple_windows_detected: true,
        suspicious_activity: true
      }));
    }
  };

  const handleNetworkChange = () => {
    if (isActive && !navigator.onLine) {
      setAntiCheatFlags(prev => ({
        ...prev,
        network_disconnections: prev.network_disconnections + 1,
        suspicious_activity: prev.network_disconnections >= 1
      }));
    }
  };

  // Helper function to map backend game types to GameEngine codes
  const mapGameType = (backendType: string): string => {
    const mapping: Record<string, string> = {
      'n_back': 'NBACK',
      'stroop': 'STROOP',
      'reaction_time': 'REACTION_TIME',
      'pattern_recognition': 'PATTERN_RECOGNITION',
      'logical_reasoning': 'LOGICAL_REASONING',
      'working_memory': 'NBACK' // Working memory uses N-Back
    };
    return mapping[backendType] || 'NBACK'; // Default to NBACK if type not found
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  const fetchAssessment = async () => {
    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch assessment');
      }
      const data = await response.json();
      setAssessment(data);
      
      // Set up timing for first game
      if (data.cognitive_games?.length > 0) {
        const firstGame = data.cognitive_games[0];
        setTimeLeft(firstGame.time_limit || 300); // 5 minutes per game default
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    try {
      // If assessment is already in progress, just activate it
      if (assessment?.status === 'IN_PROGRESS') {
        setIsActive(true);
        setAssessmentStartTime(Date.now()); // Initialize start time
        enterFullscreen(); // Force fullscreen mode
        return;
      }
      
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Use the dedicated start endpoint
      const response = await fetch(`/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        // If assessment already started, just proceed
        if (response.status === 400 && errorData.error?.includes('already been started')) {
          setIsActive(true);
          setAssessmentStartTime(Date.now()); // Initialize start time
          enterFullscreen();
          return;
        }
        throw new Error(errorData.error || 'Failed to start assessment');
      }

      setIsActive(true);
      setAssessmentStartTime(Date.now()); // Initialize start time
      enterFullscreen(); // Force fullscreen mode
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
    }
  };

  const handleNextGame = async () => {
    if (!assessment) return;

    const currentGame = assessment.cognitive_games[currentGameIndex];
    
    // Mark current game as completed (or skipped if time ran out)
    const gameResult = {
      ...currentGame,
      status: timeLeft > 0 ? 'completed' : 'skipped'
    };

    if (currentGameIndex < assessment.cognitive_games.length - 1) {
      // Move to next game
      setCurrentGameIndex(currentGameIndex + 1);
      const nextGame = assessment.cognitive_games[currentGameIndex + 1];
      setTimeLeft(nextGame.time_limit || 300);
    } else {
      // All games completed, submit assessment
      await handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Prepare final assessment data
      const finalTimeSpent = Math.floor((Date.now() - assessmentStartTime) / 1000);
      const finalData = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_score: totalScore,
        total_time_spent_seconds: finalTimeSpent,
        game_results: gameResults,
        anti_cheat_flags: antiCheatFlags
      };

      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        router.push(`/candidate/assessment/${assessmentId}/results`);
      } else {
        console.error('Failed to submit assessment:', await response.text());
        // Still redirect even if submission fails
        router.push(`/candidate/assessment/${assessmentId}/results`);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      // Still redirect even if submission fails
      router.push('/candidate/dashboard');
    }
  };

  const handleGameComplete = async (gameResult: any) => {
    updateLastActivity();
    
    if (!assessment || !gameResult) return;

    const currentGame = assessment.cognitive_games[currentGameIndex];
    if (!currentGame) return;

    try {
      // Store the game result
      setGameResults(prev => ({
        ...prev,
        [currentGame.id]: gameResult[0] // GameEngine returns array with single result
      }));

      // Submit the game result to backend
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const submitResponse = await fetch(`/api/assessments/items/${currentGame.id}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          score: gameResult[0].score,
          metrics_json: gameResult[0],
          response_time_ms: gameResult[0].averageResponseTime
        })
      });

      if (!submitResponse.ok) {
        console.error('Failed to submit game result:', await submitResponse.text());
      }

      // Calculate total score from all completed games
      const allResults = { ...gameResults, [currentGame.id]: gameResult[0] };
      const scores = Object.values(allResults).map((result: any) => result.score).filter(score => score != null);
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      setTotalScore(Math.round(averageScore));

      // Calculate total time spent so far
      const timeSpent = Math.floor((Date.now() - assessmentStartTime) / 1000);
      setTotalTimeSpent(timeSpent);

      // Show results for this game
      setCurrentGameResult(gameResult[0]);
      setShowGameResults(true);

      // Don't move to next game immediately - wait for user to continue
    } catch (error) {
      console.error('Error handling game completion:', error);
      // Still show results even if submission fails
      setCurrentGameResult(gameResult[0]);
      setShowGameResults(true);
    }
  };

  const handleContinueToNextGame = () => {
    setShowGameResults(false);
    setCurrentGameResult(null);

    // Move to next game or complete assessment
    if (currentGameIndex < assessment!.cognitive_games.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1);
      const nextGame = assessment!.cognitive_games[currentGameIndex + 1];
      setTimeLeft(nextGame.time_limit || 300);
    } else {
      // All games completed, submit assessment
      handleSubmitAssessment();
    }
  };

  const handleTimeUp = async () => {
    // Total time is up, force submit assessment
    await handleSubmitAssessment();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!assessment?.cognitive_games.length) return 0;
    return ((currentGameIndex + 1) / assessment.cognitive_games.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-red-500/30 max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Assessment</h2>
          <p className="text-red-400 mb-6">{error}</p>
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

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-slate-700 max-w-md">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Assessment Found</h2>
          <p className="text-slate-400 mb-6">You don&apos;t have any active assessments at the moment.</p>
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

  // Safety check for cognitive_games
  if (!assessment.cognitive_games || assessment.cognitive_games.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-xl font-semibold text-white mb-2">No Games Available</h2>
          <p className="text-slate-400 mb-6">This assessment doesn&apos;t have any cognitive games configured yet.</p>
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

  const currentGame = assessment.cognitive_games[currentGameIndex];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Anti-cheat warnings */}
      {antiCheatFlags.suspicious_activity && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-50">
          <strong>⚠️ Warning:</strong> Suspicious activity detected. Your assessment is being monitored.
        </div>
      )}

      {!isFullscreen && isActive && (
        <div className="fixed top-12 left-0 right-0 bg-orange-600 text-white p-2 text-center z-40">
          <strong>🔒 Please stay in fullscreen mode</strong> - Click to restore fullscreen
        </div>
      )}

      {/* Header with timer and progress */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cognitive Assessment
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-400">
                Game {currentGameIndex + 1} of {assessment.cognitive_games.length}
              </div>
              <div className="w-48 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Game timer */}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-lg font-mono ${timeLeft < 30 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Total timer */}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className={`text-sm font-mono ${totalTimeLeft < 300 ? 'text-orange-400' : 'text-slate-300'}`}>
                Total: {formatTime(totalTimeLeft)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {!isActive ? (
          // Assessment start screen
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white">Ready to Begin Assessment</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Assessment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Games:</span>
                      <span className="text-white">{assessment.cognitive_games.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Time Limit:</span>
                      <span className="text-white">25 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Game Type:</span>
                      <span className="text-white">{currentGame?.title || 'Cognitive Test'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Important Guidelines</h3>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Stay in fullscreen mode throughout the test
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Do not switch tabs or minimize the window
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Complete each game within the time limit
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Answer honestly and to the best of your ability
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleStartAssessment}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center mx-auto text-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Active assessment game
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">{currentGame?.title}</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-100">Game {currentGameIndex + 1} of {assessment.cognitive_games.length}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    timeLeft > 60 ? 'bg-green-500/20 text-green-300' : 
                    timeLeft > 30 ? 'bg-yellow-500/20 text-yellow-300' : 
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 min-h-[400px]">
              {/* Game Results Display */}
              {showGameResults && currentGameResult && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Game Completed!</h2>
                    <p className="text-slate-300">{assessment?.cognitive_games[currentGameIndex]?.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {currentGameResult.score || 0}
                      </div>
                      <div className="text-sm text-slate-300">Score</div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {currentGameResult.accuracy ? Math.round(currentGameResult.accuracy) : 0}%
                      </div>
                      <div className="text-sm text-slate-300">Accuracy</div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        {currentGameResult.averageResponseTime ? Math.round(currentGameResult.averageResponseTime) : 0}ms
                      </div>
                      <div className="text-sm text-slate-300">Avg Response Time</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Time Spent:</span>
                      <span className="text-xl font-bold text-white">{formatTime(totalTimeSpent)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-300">Overall Progress:</span>
                      <span className="text-xl font-bold text-blue-400">{getProgressPercentage().toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleContinueToNextGame}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      {currentGameIndex < assessment!.cognitive_games.length - 1 ? 'Continue to Next Game' : 'Complete Assessment'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Actual Game Engine */}
              {!showGameResults && currentGame && (
                <GameEngine
                  gameCode={mapGameType(currentGame.type)}
                  gameConfig={{
                    timeLimit: currentGame.time_limit || 300,
                    difficulty: 'medium',
                    n: 2, // For N-Back games
                    trials: 20, // Number of trials
                    stimulusDuration: 1500, // Duration to show stimulus
                    isi: 2000, // Inter-stimulus interval
                    targets: 0.3, // Target frequency (30%)
                    timer: currentGame.time_limit || 300,
                    minDelay: 500, // Minimum delay before stimulus (ms)
                    maxDelay: 2000, // Maximum delay before stimulus (ms)
                    jobRole: assessment.job_role_title || 'General' // Pass job role for personalization
                  }}
                  onComplete={handleGameComplete}
                  onProgress={(progress) => {
                    // Update progress if needed
                    console.log('Game progress:', progress);
                  }}
                />
              )}
              
              {!currentGame && !showGameResults && (
                <div className="text-center text-white">
                  <p>Loading game...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced Anti-cheat monitoring display */}
        {isActive && (
          <div key={`monitoring-${forceUpdate}`} className={`mt-6 backdrop-blur-sm rounded-lg p-4 border transition-all duration-300 ${
            antiCheatFlags.suspicious_activity
              ? 'bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20'
              : 'bg-slate-800/30 border-slate-700/50'
          }`}>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-slate-400 font-medium">Real-time Monitoring Status:</span>
              <div className="flex items-center space-x-2">
                <span className={`flex items-center font-semibold ${
                  antiCheatFlags.suspicious_activity ? 'text-red-400' : 'text-green-400'
                }`}>
                  <span className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
                    antiCheatFlags.suspicious_activity ? 'bg-red-400' : 'bg-green-400'
                  }`}></span>
                  {antiCheatFlags.suspicious_activity ? '⚠️ Suspicious Activity Detected' : '✅ Assessment Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Tab Switches:</span>
                <span className={`font-mono ${antiCheatFlags.tab_switches > 1 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {antiCheatFlags.tab_switches}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Window Blur:</span>
                <span className={`font-mono ${antiCheatFlags.window_blur_count > 2 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {antiCheatFlags.window_blur_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Copy/Paste:</span>
                <span className={`font-mono ${antiCheatFlags.copy_paste_attempts > 1 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {antiCheatFlags.copy_paste_attempts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rapid Keys:</span>
                <span className={`font-mono ${antiCheatFlags.rapid_key_presses > 9 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {antiCheatFlags.rapid_key_presses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Focus Loss:</span>
                <span className={`font-mono ${antiCheatFlags.total_focus_loss_time > 180000 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {Math.round(antiCheatFlags.total_focus_loss_time / 1000)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mouse Activity:</span>
                <span className="text-slate-300 font-mono">{antiCheatFlags.mouse_movements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keyboard:</span>
                <span className="text-slate-300 font-mono">{antiCheatFlags.keyboard_activity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network:</span>
                <span className={`font-mono ${antiCheatFlags.network_disconnections > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                  {antiCheatFlags.network_disconnections === 0 ? 'Stable' : `${antiCheatFlags.network_disconnections} drops`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Activity:</span>
                <span className="text-green-400 font-mono">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                  Live
                </span>
              </div>
            </div>

            {/* Real-time warning alerts */}
            {antiCheatFlags.suspicious_activity && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300 animate-pulse">
                <div className="flex items-center mb-2">
                  <span className="text-red-400 font-bold mr-2">🚨 ALERT:</span>
                  <span>Suspicious activity detected - Assessment integrity compromised</span>
                </div>
                <div className="text-xs text-red-400">
                  {antiCheatFlags.dev_tools_opened && '• Developer tools opened • '}
                  {antiCheatFlags.multiple_windows_detected && '• Multiple windows detected • '}
                  {antiCheatFlags.external_apps_focused && '• External application focus detected • '}
                  {antiCheatFlags.tab_switches > 1 && '• Multiple tab switches • '}
                  {antiCheatFlags.copy_paste_attempts > 0 && '• Copy/paste attempts • '}
                  {antiCheatFlags.fullscreen_exit_count > 0 && '• Fullscreen exited • '}
                  {antiCheatFlags.network_disconnections > 0 && '• Network issues detected'}
                </div>
              </div>
            )}

            {/* Activity heartbeat */}
            <div className="mt-2 flex justify-center">
              <div className="flex items-center text-xs text-slate-500">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-ping mr-2"></span>
                Real-time monitoring active
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
