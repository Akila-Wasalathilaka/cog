// Enhanced Cognitive games and assessment system with Mistral AI integration

export interface CognitiveGame {
  id: string;
  job_role_id?: string;
  name: string;
  description: string;
  instructions: string;
  type: 'stroop' | 'n-back' | 'reaction-time' | 'pattern-recognition' | 'working-memory' | 'sustained-attention' | 'complex-processing' | 'task-switching';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: CognitiveQuestion[];
  timeLimit: number;
  cognitiveAspects: string[];
}

export interface CognitiveQuestion {
  id: string;
  type: string;
  content: any;
  correct_answer: any;
  time_limit?: number;
  difficulty: number;
}

export interface AssessmentSession {
  id: string;
  candidate_id: string;
  job_role_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  started_at?: string;
  completed_at?: string;
  total_score?: number;
  cognitive_games: CognitiveGameResult[];
  cognitive_profile?: CognitiveProfile;
  ai_analysis?: string;
  created_at: string;
}

export interface CognitiveGameResult {
  game_id: string;
  game_type: string;
  game_name: string;
  status: 'pending' | 'completed' | 'skipped';
  score: number;
  max_score: number;
  time_taken: number;
  accuracy: number;
  responses: GameResponse[];
  cognitive_metrics: {
    reaction_time_avg: number;
    consistency: number;
    improvement_rate: number;
  };
}

export interface GameResponse {
  question_id: string;
  response: any;
  correct_answer: any;
  is_correct: boolean;
  reaction_time: number;
  timestamp: string;
}

export interface CognitiveProfile {
  memory_score: number;
  attention_score: number;
  reasoning_score: number;
  processing_speed_score: number;
  spatial_reasoning_score: number;
  overall_percentile: number;
  strengths: string[];
  areas_for_improvement: string[];
}

// Mock assessment sessions data
const assessmentSessions: AssessmentSession[] = [
  {
    id: 'assess_1',
    candidate_id: 'cand_1',
    job_role_id: '1',
    status: 'completed',
    started_at: '2024-01-15T10:05:00Z',
    completed_at: '2024-01-15T10:35:00Z',
    total_score: 85,
    cognitive_games: [
      {
        game_id: 'stroop_1',
        game_type: 'stroop',
        game_name: 'Attention & Focus Test',
        status: 'completed',
        score: 18,
        max_score: 20,
        time_taken: 120,
        accuracy: 0.9,
        responses: [],
        cognitive_metrics: {
          reaction_time_avg: 1.2,
          consistency: 0.85,
          improvement_rate: 0.1
        }
      }
    ],
    cognitive_profile: {
      memory_score: 82,
      attention_score: 90,
      reasoning_score: 78,
      processing_speed_score: 88,
      spatial_reasoning_score: 85,
      overall_percentile: 87,
      strengths: ['Attention', 'Processing Speed'],
      areas_for_improvement: ['Reasoning']
    },
    ai_analysis: 'Strong cognitive performance with excellent attention and processing speed. Well-suited for software development role.',
    created_at: '2024-01-15T10:00:00Z'
  }
];

// Mock cognitive games data
const cognitiveGames: CognitiveGame[] = [
  {
    id: 'game_1',
    job_role_id: '1',
    name: 'Pattern Recognition Challenge',
    description: 'Identify logical patterns in sequences to test reasoning ability',
    instructions: 'Look at the pattern and select the next item in the sequence.',
    type: 'pattern-recognition',
    difficulty: 'hard',
    questions: [],
    timeLimit: 300,
    cognitiveAspects: ['reasoning', 'pattern_recognition']
  },
  {
    id: 'game_2',
    job_role_id: '1',
    name: 'Working Memory Test',
    description: 'Remember and recall sequences to test working memory',
    instructions: 'Remember the sequence shown and reproduce it correctly.',
    type: 'working-memory',
    difficulty: 'hard',
    questions: [],
    timeLimit: 240,
    cognitiveAspects: ['working_memory', 'memory_span']
  }
];

// Enhanced CRUD operations for cognitive games
export const cognitiveGamesStore = {
  getAll: () => [...cognitiveGames],
  getById: (id: string) => cognitiveGames.find(g => g.id === id),
  getByJobRoleId: (jobRoleId: string) => cognitiveGames.filter(g => g.job_role_id === jobRoleId),
  
  create: (gameData: Omit<CognitiveGame, 'id'>) => {
    const newGame: CognitiveGame = {
      ...gameData,
      id: `game_${Date.now()}`
    };
    cognitiveGames.push(newGame);
    return newGame;
  },
  
  delete: (id: string) => {
    const index = cognitiveGames.findIndex(g => g.id === id);
    if (index === -1) return false;
    cognitiveGames.splice(index, 1);
    return true;
  }
};

// Enhanced CRUD operations for assessment sessions
export const assessmentSessionsStore = {
  getAll: () => [...assessmentSessions],
  getById: (id: string) => assessmentSessions.find(s => s.id === id),
  getByCandidateId: (candidateId: string) => assessmentSessions.filter(s => s.candidate_id === candidateId),
  getByJobRoleId: (jobRoleId: string) => assessmentSessions.filter(s => s.job_role_id === jobRoleId),
  getCompleted: () => assessmentSessions.filter(s => s.status === 'completed'),
  
  create: (sessionData: {
    candidate_id: string;
    job_role_id: string;
    cognitive_games: any[];
  }) => {
    const newSession: AssessmentSession = {
      id: `session_${Date.now()}`,
      candidate_id: sessionData.candidate_id,
      job_role_id: sessionData.job_role_id,
      status: 'pending',
      cognitive_games: sessionData.cognitive_games.map(game => ({
        game_id: game.id,
        game_type: game.type,
        game_name: game.name,
        status: 'pending',
        score: 0,
        max_score: game.questions?.length || 0,
        time_taken: 0,
        accuracy: 0,
        responses: [],
        cognitive_metrics: {
          reaction_time_avg: 0,
          consistency: 0,
          improvement_rate: 0
        }
      })),
      created_at: new Date().toISOString()
    };
    assessmentSessions.push(newSession);
    return newSession;
  },
  
  startSession: (id: string) => {
    const session = assessmentSessions.find(s => s.id === id);
    if (session) {
      session.status = 'in_progress';
      session.started_at = new Date().toISOString();
      return session;
    }
    return null;
  },
  
  completeSession: (id: string, results: {
    total_score: number;
    cognitive_profile: CognitiveProfile;
    ai_analysis: string;
  }) => {
    const session = assessmentSessions.find(s => s.id === id);
    if (session) {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
      session.total_score = results.total_score;
      session.cognitive_profile = results.cognitive_profile;
      session.ai_analysis = results.ai_analysis;
      return session;
    }
    return null;
  },
  
  getLeaderboard: () => {
    return assessmentSessions
      .filter(s => s.status === 'completed' && s.total_score !== undefined)
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .map(s => ({
        session_id: s.id,
        candidate_id: s.candidate_id,
        job_role_id: s.job_role_id,
        total_score: s.total_score,
        cognitive_profile: s.cognitive_profile,
        completed_at: s.completed_at
      }));
  },
  
  getAnalytics: () => {
    const completed = assessmentSessions.filter(s => s.status === 'completed');
    const avgScore = completed.reduce((sum, s) => sum + (s.total_score || 0), 0) / completed.length || 0;
    
    return {
      total_sessions: assessmentSessions.length,
      completed_sessions: completed.length,
      average_score: Math.round(avgScore),
      completion_rate: completed.length / assessmentSessions.length || 0,
      top_performer: completed.sort((a, b) => (b.total_score || 0) - (a.total_score || 0))[0]
    };
  },
  
  delete: (id: string) => {
    const index = assessmentSessions.findIndex(s => s.id === id);
    if (index === -1) return false;
    assessmentSessions.splice(index, 1);
    return true;
  },

  update: (id: string, updates: Partial<AssessmentSession>) => {
    const index = assessmentSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    assessmentSessions[index] = { ...assessmentSessions[index], ...updates };
    return assessmentSessions[index];
  },

  // Auto-create comprehensive assessment when candidate is created
  createAssessmentForCandidate: async (candidateId: string, jobRoleId: string) => {
    try {
      console.log(`🎯 Creating comprehensive AI assessment for candidate ${candidateId} with job role ${jobRoleId}`);
      
      // Import required services
      const { generateCognitiveGames } = await import('@/lib/services/mistral-ai');
      const { jobRolesStore } = await import('./job-roles');
      
      // Get job role details for context
      const jobRole = jobRolesStore.getById(jobRoleId);
      if (!jobRole) {
        throw new Error(`Job role ${jobRoleId} not found`);
      }
      
      console.log(`📋 Generating cognitive games for ${jobRole.title} role...`);
      
      // Generate comprehensive set of cognitive games (20-25 questions)
      const aiGames = await generateCognitiveGames(jobRoleId, 22);
      
      console.log(`✅ Generated ${aiGames.length} AI-powered cognitive games:`);
      aiGames.forEach((game, index) => {
        console.log(`  ${index + 1}. ${game.name} (${game.type}) - ${game.questions.length} questions`);
      });
      
      // Create comprehensive cognitive game results with detailed scoring
      const cognitiveGames: CognitiveGameResult[] = aiGames.map((game, index) => {
        const maxScore = game.questions.length * 10; // 10 points per question for better granularity
        
        return {
          game_id: `ai_${game.type}_${Date.now()}_${index}`,
          game_type: game.type,
          game_name: game.name,
          status: 'pending' as const,
          score: 0,
          max_score: maxScore,
          time_taken: 0,
          accuracy: 0,
          responses: [],
          cognitive_metrics: {
            reaction_time_avg: 0,
            consistency: 0,
            improvement_rate: 0
          }
        };
      });

      // Calculate total assessment metrics
      const totalQuestions = aiGames.reduce((sum, game) => sum + game.questions.length, 0);
      const totalMaxScore = cognitiveGames.reduce((sum, game) => sum + game.max_score, 0);
      const estimatedDuration = Math.ceil(totalQuestions * 1.5); // 1.5 minutes per question on average

      const newAssessment: AssessmentSession = {
        id: `assess_${Date.now()}`,
        candidate_id: candidateId,
        job_role_id: jobRoleId,
        status: 'pending',
        total_score: undefined,
        cognitive_games: cognitiveGames,
        ai_analysis: `🤖 Comprehensive AI-generated assessment for ${jobRole.title} position\n\n` +
                    `📊 Assessment Details:\n` +
                    `• ${aiGames.length} cognitive games tailored to role requirements\n` +
                    `• ${totalQuestions} total questions across multiple cognitive domains\n` +
                    `• Estimated completion time: ${estimatedDuration} minutes\n` +
                    `• Maximum possible score: ${totalMaxScore} points\n\n` +
                    `🎯 Cognitive Areas Assessed:\n` +
                    `${Array.from(new Set(aiGames.flatMap(g => g.cognitiveAspects))).map(aspect => `• ${aspect.replace('_', ' ').toUpperCase()}`).join('\n')}\n\n` +
                    `🧠 Games Include: ${aiGames.map(g => g.name).join(', ')}`,
        created_at: new Date().toISOString()
      };

      assessmentSessions.push(newAssessment);
      
      console.log(`🎉 Successfully created comprehensive assessment ${newAssessment.id}`);
      console.log(`📈 Total assessment scope: ${totalQuestions} questions, ${totalMaxScore} max points`);
      
      return newAssessment;
    } catch (error) {
      console.error('❌ Error creating AI assessment:', error);
      
      // Enhanced fallback: create role-specific basic assessment
      const { jobRolesStore } = await import('./job-roles');
      const jobRole = jobRolesStore.getById(jobRoleId);
      
      const fallbackGames: CognitiveGameResult[] = [
        {
          game_id: `fallback_stroop_${Date.now()}`,
          game_type: 'stroop',
          game_name: `Attention & Focus Test - ${jobRole?.title || 'General'}`,
          status: 'pending',
          score: 0,
          max_score: 200,
          time_taken: 0,
          accuracy: 0,
          responses: [],
          cognitive_metrics: {
            reaction_time_avg: 0,
            consistency: 0,
            improvement_rate: 0
          }
        },
        {
          game_id: `fallback_nback_${Date.now()}`,
          game_type: 'n-back',
          game_name: `Memory & Attention Test - ${jobRole?.title || 'General'}`,
          status: 'pending',
          score: 0,
          max_score: 150,
          time_taken: 0,
          accuracy: 0,
          responses: [],
          cognitive_metrics: {
            reaction_time_avg: 0,
            consistency: 0,
            improvement_rate: 0
          }
        },
        {
          game_id: `fallback_reaction_${Date.now()}`,
          game_type: 'reaction-time',
          game_name: `Processing Speed Test - ${jobRole?.title || 'General'}`,
          status: 'pending',
          score: 0,
          max_score: 100,
          time_taken: 0,
          accuracy: 0,
          responses: [],
          cognitive_metrics: {
            reaction_time_avg: 0,
            consistency: 0,
            improvement_rate: 0
          }
        }
      ];
      
      const fallbackAssessment: AssessmentSession = {
        id: `assess_fallback_${Date.now()}`,
        candidate_id: candidateId,
        job_role_id: jobRoleId,
        status: 'pending',
        cognitive_games: fallbackGames,
        ai_analysis: `🔧 Fallback assessment created for ${jobRole?.title || 'General'} position\n\n` +
                    `⚠️ Note: AI game generation temporarily unavailable\n` +
                    `📋 This assessment includes 3 core cognitive tests:\n` +
                    `• Attention & Focus (Stroop Test)\n` +
                    `• Memory & Attention (N-Back Test)\n` +
                    `• Processing Speed (Reaction Time Test)\n\n` +
                    `🎯 Total Questions: 45 | Max Score: 450 points`,
        created_at: new Date().toISOString()
      };

      assessmentSessions.push(fallbackAssessment);
      
      console.log(`⚠️ Created fallback assessment ${fallbackAssessment.id} due to AI service error`);
      
      return fallbackAssessment;
    }
  }
};
