// Mistral AI service for generating cognitive games based on job roles

interface CognitiveGame {
  id: string;
  type: 'stroop' | 'n-back' | 'reaction-time' | 'pattern-recognition' | 'working-memory' | 'sustained-attention' | 'complex-processing' | 'task-switching';
  name: string;
  description: string;
  instructions: string;
  questions: CognitiveQuestion[];
  timeLimit: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  cognitiveAspects: string[];
}

interface CognitiveQuestion {
  id: string;
  type: string;
  content: any;
  correctAnswer: any;
  timeLimit?: number;
  difficulty: number;
}

interface JobRoleCognitiveFocus {
  memoryIntensity: number; // 1-10
  attentionFocus: number;
  processingSpeed: number;
  executiveFunction: number;
  spatialReasoning: number;
}

class MistralAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.mistral.ai/v1';

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Mistral API key not found in environment variables');
    }
  }

  // Job role cognitive requirements mapping
  private getJobRoleCognitiveFocus(jobRole: string): JobRoleCognitiveFocus {
    const lowerRole = jobRole.toLowerCase();
    
    if (lowerRole.includes('software') || lowerRole.includes('developer') || lowerRole.includes('engineer')) {
      return {
        memoryIntensity: 8,
        attentionFocus: 9,
        processingSpeed: 8,
        executiveFunction: 9,
        spatialReasoning: 7
      };
    } else if (lowerRole.includes('data') || lowerRole.includes('analyst')) {
      return {
        memoryIntensity: 9,
        attentionFocus: 8,
        processingSpeed: 9,
        executiveFunction: 8,
        spatialReasoning: 8
      };
    } else if (lowerRole.includes('designer') || lowerRole.includes('ui') || lowerRole.includes('ux')) {
      return {
        memoryIntensity: 6,
        attentionFocus: 9,
        processingSpeed: 7,
        executiveFunction: 7,
        spatialReasoning: 9
      };
    } else if (lowerRole.includes('manager') || lowerRole.includes('lead')) {
      return {
        memoryIntensity: 7,
        attentionFocus: 8,
        processingSpeed: 7,
        executiveFunction: 9,
        spatialReasoning: 6
      };
    } else {
      // Default cognitive profile
      return {
        memoryIntensity: 7,
        attentionFocus: 7,
        processingSpeed: 7,
        executiveFunction: 7,
        spatialReasoning: 7
      };
    }
  }

  // Generate cognitive games for a specific job role
  async generateCognitiveGamesForJobRole(jobRole: string, _candidateId: string): Promise<CognitiveGame[]> { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log(`🧠 Generating comprehensive cognitive games for ${jobRole} role...`);
    
    const cognitiveFocus = this.getJobRoleCognitiveFocus(jobRole);
    const games: CognitiveGame[] = [];

    try {
      // Core Cognitive Battery - Always include these essential tests
      console.log(`📋 Creating core cognitive battery...`);
      
      // 1. Stroop Test (Attention & Inhibitory Control) - 20 questions
      const stroopGame = await this.generateStroopTest(jobRole, cognitiveFocus);
      games.push(stroopGame);
      console.log(`✅ Added Stroop Test (${stroopGame.questions.length} questions)`);

      // 2. N-Back Test (Working Memory) - Variable difficulty
      const nBackGame = await this.generateNBackTest(jobRole, cognitiveFocus);
      games.push(nBackGame);
      console.log(`✅ Added N-Back Test (${nBackGame.questions.length} questions)`);

      // 3. Reaction Time Test (Processing Speed) - 15 trials
      const reactionGame = await this.generateReactionTimeTest(jobRole, cognitiveFocus);
      games.push(reactionGame);
      console.log(`✅ Added Reaction Time Test (${reactionGame.questions.length} questions)`);

      // Role-Specific Cognitive Tests based on job requirements
      console.log(`🎯 Adding role-specific cognitive tests...`);

      // 4. Pattern Recognition (Executive Function & Logic)
      if (cognitiveFocus.spatialReasoning >= 6 || cognitiveFocus.executiveFunction >= 6) {
        const patternGame = await this.generatePatternRecognitionTest(jobRole, cognitiveFocus);
        games.push(patternGame);
        console.log(`✅ Added Pattern Recognition Test (${patternGame.questions.length} questions)`);
      }

      // 5. Enhanced Working Memory Test for high-demand roles
      if (cognitiveFocus.memoryIntensity >= 8) {
        const workingMemoryGame = await this.generateWorkingMemoryTest(jobRole, cognitiveFocus);
        games.push(workingMemoryGame);
        console.log(`✅ Added Working Memory Test (${workingMemoryGame.questions.length} questions)`);
      }

      // 6. Additional tests for specific cognitive demands
      if (cognitiveFocus.attentionFocus >= 8) {
        // Add Sustained Attention Test for highly attention-demanding roles
        const sustainedAttentionGame = await this.generateSustainedAttentionTest(jobRole, cognitiveFocus);
        games.push(sustainedAttentionGame);
        console.log(`✅ Added Sustained Attention Test (${sustainedAttentionGame.questions.length} questions)`);
      }

      if (cognitiveFocus.processingSpeed >= 8) {
        // Add Complex Processing Speed Test
        const complexProcessingGame = await this.generateComplexProcessingTest(jobRole, cognitiveFocus);
        games.push(complexProcessingGame);
        console.log(`✅ Added Complex Processing Test (${complexProcessingGame.questions.length} questions)`);
      }

      if (cognitiveFocus.executiveFunction >= 8) {
        // Add Task Switching Test for executive-heavy roles
        const taskSwitchingGame = await this.generateTaskSwitchingTest(jobRole, cognitiveFocus);
        games.push(taskSwitchingGame);
        console.log(`✅ Added Task Switching Test (${taskSwitchingGame.questions.length} questions)`);
      }

      const totalQuestions = games.reduce((sum, game) => sum + game.questions.length, 0);
      console.log(`🎉 Generated ${games.length} cognitive games with ${totalQuestions} total questions for ${jobRole}`);

      return games;
    } catch (error) {
      console.error('❌ Error generating cognitive games:', error);
      console.log(`🔧 Falling back to standard cognitive battery...`);
      // Return comprehensive fallback games if AI generation fails
      return this.getFallbackGames(jobRole);
    }
  }

  // Generate Stroop Test with AI-powered customization
  private async generateStroopTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const prompt = `Generate a Stroop test for a ${jobRole} position. Create 20 color-word combinations where the word and color don't match. Focus on attention and processing speed. Return as JSON with words and colors.`;
    
    try {
      const aiResponse = await this.callMistralAPI(prompt);
      const aiData = JSON.parse(aiResponse);
      
      const questions: CognitiveQuestion[] = aiData.items?.slice(0, 20).map((item: any, index: number) => ({
        id: `stroop_${Date.now()}_${index}`,
        type: 'stroop',
        content: {
          word: item.word || 'RED',
          color: item.displayColor || '#0000FF',
          correctColor: item.correctAnswer || 'BLUE'
        },
        correctAnswer: item.correctAnswer || 'BLUE',
        timeLimit: Math.max(2, 5 - Math.floor(focus.processingSpeed / 3)),
        difficulty: focus.attentionFocus
      })) || this.generateFallbackStroopQuestions();

      return {
        id: `stroop_${Date.now()}`,
        type: 'stroop',
        name: `Attention & Focus Test - ${jobRole}`,
        description: 'Test your ability to focus and ignore distracting information',
        instructions: 'Say the COLOR of the word, not the word itself. Ignore what the word says and focus only on the color it appears in.',
        questions,
        timeLimit: questions.length * 4,
        difficulty: focus.attentionFocus >= 8 ? 'hard' : focus.attentionFocus >= 6 ? 'medium' : 'easy',
        cognitiveAspects: ['attention', 'processing_speed', 'inhibition']
      };
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return this.getFallbackStroopTest(jobRole, focus);
    }
  }

  // Generate N-Back Test
  private async generateNBackTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const nValue = Math.min(4, Math.max(1, Math.floor(focus.memoryIntensity / 2.5)));
    
    const prompt = `Generate an N-Back working memory test for a ${jobRole} with N=${nValue}. Create 30 sequences of letters or numbers. Include target and non-target trials. Return as JSON.`;
    
    try {
      const aiResponse = await this.callMistralAPI(prompt);
      const aiData = JSON.parse(aiResponse);
      
      const questions: CognitiveQuestion[] = aiData.sequences?.slice(0, 30).map((seq: any, index: number) => ({
        id: `nback_${Date.now()}_${index}`,
        type: 'n-back',
        content: {
          stimulus: seq.stimulus || String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          isTarget: seq.isTarget || Math.random() < 0.3,
          position: index,
          nValue: nValue
        },
        correctAnswer: seq.isTarget || Math.random() < 0.3,
        timeLimit: 3,
        difficulty: nValue
      })) || this.generateFallbackNBackQuestions(nValue);

      return {
        id: `nback_${Date.now()}`,
        type: 'n-back',
        name: `Working Memory Test (${nValue}-Back) - ${jobRole}`,
        description: `Test your working memory capacity with ${nValue}-back task`,
        instructions: `Press YES when you see the same letter that appeared ${nValue} positions back. Press NO otherwise.`,
        questions,
        timeLimit: questions.length * 4,
        difficulty: nValue >= 3 ? 'hard' : nValue >= 2 ? 'medium' : 'easy',
        cognitiveAspects: ['working_memory', 'attention', 'executive_function']
      };
    } catch (error) {
      return this.getFallbackNBackTest(jobRole, focus, nValue);
    }
  }

  // Generate Reaction Time Test
  private async generateReactionTimeTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const questions: CognitiveQuestion[] = Array.from({ length: 20 }, (_, index) => ({
      id: `reaction_${Date.now()}_${index}`,
      type: 'reaction-time',
      content: {
        delay: Math.random() * 3000 + 1000, // 1-4 second delay
        stimulus: 'CLICK',
        color: ['#ff0000', '#00ff00', '#0000ff'][Math.floor(Math.random() * 3)]
      },
      correctAnswer: 'click',
      timeLimit: 5,
      difficulty: focus.processingSpeed
    }));

    return {
      id: `reaction_${Date.now()}`,
      type: 'reaction-time',
      name: `Processing Speed Test - ${jobRole}`,
      description: 'Test your reaction time and processing speed',
      instructions: 'Click as quickly as possible when you see the stimulus appear.',
      questions,
      timeLimit: 120,
      difficulty: focus.processingSpeed >= 8 ? 'hard' : focus.processingSpeed >= 6 ? 'medium' : 'easy',
      cognitiveAspects: ['processing_speed', 'attention', 'motor_response']
    };
  }

  // Generate Pattern Recognition Test
  private async generatePatternRecognitionTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const prompt = `Generate pattern recognition problems for a ${jobRole}. Create 15 visual/logical patterns with multiple choice answers. Focus on spatial reasoning and executive function.`;
    
    try {
      const questions: CognitiveQuestion[] = Array.from({ length: 15 }, (_, index) => ({
        id: `pattern_${Date.now()}_${index}`,
        type: 'pattern-recognition',
        content: {
          pattern: this.generatePatternSequence(),
          options: this.generatePatternOptions(),
          context: jobRole
        },
        correctAnswer: 'A', // Would be determined by pattern logic
        timeLimit: 30,
        difficulty: focus.spatialReasoning
      }));

      return {
        id: `pattern_${Date.now()}`,
        type: 'pattern-recognition',
        name: `Pattern Recognition Test - ${jobRole}`,
        description: 'Test your ability to identify patterns and logical sequences',
        instructions: 'Identify the missing element or next item in the pattern sequence.',
        questions,
        timeLimit: questions.length * 35,
        difficulty: focus.spatialReasoning >= 8 ? 'hard' : focus.spatialReasoning >= 6 ? 'medium' : 'easy',
        cognitiveAspects: ['spatial_reasoning', 'pattern_recognition', 'executive_function']
      };
    } catch (error) {
      return this.getFallbackPatternTest(jobRole, focus);
    }
  }

  // Generate Working Memory Test
  private async generateWorkingMemoryTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const questions: CognitiveQuestion[] = Array.from({ length: 25 }, (_, index) => ({
      id: `memory_${Date.now()}_${index}`,
      type: 'working-memory',
      content: {
        sequence: this.generateMemorySequence(Math.min(9, 3 + Math.floor(focus.memoryIntensity / 2))),
        type: Math.random() < 0.5 ? 'forward' : 'backward'
      },
      correctAnswer: '', // Will be filled based on sequence
      timeLimit: 10,
      difficulty: focus.memoryIntensity
    }));

    return {
      id: `memory_${Date.now()}`,
      type: 'working-memory',
      name: `Memory Span Test - ${jobRole}`,
      description: 'Test your working memory capacity and manipulation',
      instructions: 'Remember the sequence and repeat it forward or backward as instructed.',
      questions,
      timeLimit: questions.length * 15,
      difficulty: focus.memoryIntensity >= 8 ? 'hard' : focus.memoryIntensity >= 6 ? 'medium' : 'easy',
      cognitiveAspects: ['working_memory', 'attention', 'memory_span']
    };
  }

  // Call Mistral AI API
  private async callMistralAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Advanced Cognitive Tests for Comprehensive Assessment

  // Sustained Attention Test - for roles requiring prolonged focus
  private async generateSustainedAttentionTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const questions: CognitiveQuestion[] = Array.from({ length: 30 }, (_, index) => ({
      id: `attention_${Date.now()}_${index}`,
      type: 'sustained-attention',
      content: {
        targetDigit: Math.floor(Math.random() * 10),
        sequence: Array.from({ length: 100 }, () => Math.floor(Math.random() * 10)),
        taskType: 'digit_vigilance'
      },
      correctAnswer: '', // Count of target digit appearances
      timeLimit: 2,
      difficulty: Math.max(5, focus.attentionFocus)
    }));

    return {
      id: `sustained_attention_${Date.now()}`,
      type: 'sustained-attention',
      name: `Sustained Attention Test - ${jobRole}`,
      description: 'Maintain focus and detect targets over extended periods',
      instructions: 'Watch the rapid sequence and count how many times the target digit appears.',
      questions,
      timeLimit: 600, // 10 minutes
      difficulty: 'hard',
      cognitiveAspects: ['sustained_attention', 'vigilance', 'focus']
    };
  }

  // Complex Processing Speed Test - multi-step cognitive operations
  private async generateComplexProcessingTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const questions: CognitiveQuestion[] = Array.from({ length: 20 }, (_, index) => ({
      id: `complex_processing_${Date.now()}_${index}`,
      type: 'complex-processing',
      content: {
        operation: ['add_subtract', 'multiply_divide', 'comparison'][index % 3],
        numbers: [Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1],
        rule: index % 2 === 0 ? 'if_even' : 'if_odd'
      },
      correctAnswer: '', // Will be calculated based on operation and rule
      timeLimit: 3,
      difficulty: Math.max(6, focus.processingSpeed)
    }));

    return {
      id: `complex_processing_${Date.now()}`,
      type: 'complex-processing',
      name: `Complex Processing Test - ${jobRole}`,
      description: 'Perform complex mental operations under time pressure',
      instructions: 'Apply the given rule to perform mathematical operations quickly and accurately.',
      questions,
      timeLimit: 180,
      difficulty: 'hard',
      cognitiveAspects: ['processing_speed', 'mental_flexibility', 'working_memory']
    };
  }

  // Task Switching Test - for executive function assessment
  private async generateTaskSwitchingTest(jobRole: string, focus: JobRoleCognitiveFocus): Promise<CognitiveGame> {
    const questions: CognitiveQuestion[] = Array.from({ length: 24 }, (_, index) => ({
      id: `task_switching_${Date.now()}_${index}`,
      type: 'task-switching',
      content: {
        stimulus: Math.floor(Math.random() * 100) + 1,
        taskCue: ['number_category', 'magnitude'][index % 2], // odd/even vs high/low
        switchTrial: index > 0 && (index % 4 === 0), // switch every 4th trial
        category: index % 2 === 0 ? 'number' : 'magnitude'
      },
      correctAnswer: '', // Will be determined by task cue
      timeLimit: 2.5,
      difficulty: Math.max(7, focus.executiveFunction)
    }));

    return {
      id: `task_switching_${Date.now()}`,
      type: 'task-switching',
      name: `Task Switching Test - ${jobRole}`,
      description: 'Switch between different cognitive tasks flexibly',
      instructions: 'Follow the task cue to categorize numbers by either odd/even or high/low (>50).',
      questions,
      timeLimit: 300,
      difficulty: 'hard',
      cognitiveAspects: ['executive_function', 'cognitive_flexibility', 'task_switching']
    };
  }

  // Fallback methods for when AI generation fails
  private getFallbackGames(jobRole: string): CognitiveGame[] {
    const focus = this.getJobRoleCognitiveFocus(jobRole);
    return [
      this.getFallbackStroopTest(jobRole, focus),
      this.getFallbackNBackTest(jobRole, focus, 2),
      this.getFallbackReactionTimeTest(jobRole, focus)
    ];
  }

  private getFallbackStroopTest(jobRole: string, focus: JobRoleCognitiveFocus): CognitiveGame {
    const questions = this.generateFallbackStroopQuestions();
    return {
      id: `stroop_fallback_${Date.now()}`,
      type: 'stroop',
      name: `Attention Test - ${jobRole}`,
      description: 'Test your attention and focus abilities',
      instructions: 'Say the COLOR of the word, not the word itself.',
      questions,
      timeLimit: 80,
      difficulty: 'medium',
      cognitiveAspects: ['attention', 'processing_speed']
    };
  }

  private getFallbackNBackTest(jobRole: string, focus: JobRoleCognitiveFocus, nValue: number): CognitiveGame {
    const questions = this.generateFallbackNBackQuestions(nValue);
    return {
      id: `nback_fallback_${Date.now()}`,
      type: 'n-back',
      name: `Memory Test - ${jobRole}`,
      description: 'Test your working memory',
      instructions: `Press YES when you see the same letter that appeared ${nValue} positions back.`,
      questions,
      timeLimit: 120,
      difficulty: 'medium',
      cognitiveAspects: ['working_memory', 'attention']
    };
  }

  private getFallbackPatternTest(jobRole: string, focus: JobRoleCognitiveFocus): CognitiveGame {
    const questions: CognitiveQuestion[] = Array.from({ length: 10 }, (_, index) => ({
      id: `pattern_fallback_${index}`,
      type: 'pattern-recognition',
      content: {
        pattern: [1, 2, 4, 8, '?'],
        options: ['16', '12', '10', '6'],
        type: 'numerical'
      },
      correctAnswer: '16',
      timeLimit: 30,
      difficulty: 5
    }));

    return {
      id: `pattern_fallback_${Date.now()}`,
      type: 'pattern-recognition',
      name: `Pattern Test - ${jobRole}`,
      description: 'Test your pattern recognition abilities',
      instructions: 'Find the missing element in the pattern.',
      questions,
      timeLimit: 300,
      difficulty: 'medium',
      cognitiveAspects: ['pattern_recognition', 'logical_reasoning']
    };
  }

  private getFallbackReactionTimeTest(jobRole: string, focus: JobRoleCognitiveFocus): CognitiveGame {
    const questions: CognitiveQuestion[] = Array.from({ length: 15 }, (_, index) => ({
      id: `reaction_fallback_${index}`,
      type: 'reaction-time',
      content: {
        stimulus: 'CLICK NOW!',
        stimulusType: 'visual',
        delay: Math.random() * 3000 + 1000 // Random delay between 1-4 seconds
      },
      correctAnswer: 'clicked',
      timeLimit: 5,
      difficulty: 3
    }));

    return {
      id: `reaction_fallback_${Date.now()}`,
      type: 'reaction-time',
      name: `Reaction Time Test - ${jobRole}`,
      description: 'Test your reaction time and attention',
      instructions: 'Click as quickly as possible when you see the stimulus.',
      questions,
      timeLimit: 180,
      difficulty: 'easy',
      cognitiveAspects: ['processing_speed', 'attention']
    };
  }

  // Helper methods for generating fallback content
  private generateFallbackStroopQuestions(): CognitiveQuestion[] {
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE'];
    const colorCodes = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ffa500', '#800080'];
    
    return Array.from({ length: 20 }, (_, index) => {
      const wordIndex = Math.floor(Math.random() * colors.length);
      let colorIndex = Math.floor(Math.random() * colors.length);
      
      // Ensure word and color don't match (Stroop effect)
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * colors.length);
      }

      return {
        id: `stroop_fallback_${index}`,
        type: 'stroop',
        content: {
          word: colors[wordIndex],
          color: colorCodes[colorIndex],
          correctColor: colors[colorIndex]
        },
        correctAnswer: colors[colorIndex],
        timeLimit: 4,
        difficulty: 5
      };
    });
  }

  private generateFallbackNBackQuestions(nValue: number): CognitiveQuestion[] {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const sequence: string[] = [];
    
    return Array.from({ length: 30 }, (_, index) => {
      let stimulus: string;
      let isTarget = false;
      
      if (index >= nValue && Math.random() < 0.3) {
        // 30% chance of target trial
        stimulus = sequence[index - nValue];
        isTarget = true;
      } else {
        stimulus = letters[Math.floor(Math.random() * letters.length)];
      }
      
      sequence.push(stimulus);

      return {
        id: `nback_fallback_${index}`,
        type: 'n-back',
        content: {
          stimulus,
          isTarget,
          position: index,
          nValue
        },
        correctAnswer: isTarget,
        timeLimit: 3,
        difficulty: nValue
      };
    });
  }

  private generatePatternSequence(): any[] {
    // Simple arithmetic progression
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 5) + 1;
    return [start, start + diff, start + 2*diff, start + 3*diff];
  }

  private generatePatternOptions(): string[] {
    return ['A', 'B', 'C', 'D'];
  }

  private generateMemorySequence(length: number): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  }
}

export const mistralAIService = new MistralAIService();
export default mistralAIService;

// Wrapper function for the assessment creation
export async function generateCognitiveGames(jobRoleId: string, gameCount: number = 18): Promise<CognitiveGame[]> {
  // Get job role information
  const { jobRolesStore } = await import('@/lib/data/job-roles');
  const jobRole = jobRolesStore.getById(jobRoleId);
  
  if (!jobRole) {
    throw new Error('Job role not found');
  }
  
  return mistralAIService.generateCognitiveGamesForJobRole(jobRole.title, `candidate_${Date.now()}`);
}
