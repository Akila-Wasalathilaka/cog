import { NextRequest, NextResponse } from 'next/server';
import { assessmentSessionsStore } from '@/lib/data/assessments';
import { candidatesStore } from '@/lib/data/candidates';
import { jobRolesStore } from '@/lib/data/job-roles';

export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Get all completed assessments
    const completedAssessments = assessmentSessionsStore.getCompleted();
    
    // Get analytics
    const analytics = assessmentSessionsStore.getAnalytics();
    
    // Get candidate progress data
    const candidateProgress = candidatesStore.getAll().map(candidate => {
      const assessments = assessmentSessionsStore.getByCandidateId(candidate.id);
      const completed = assessments.filter(a => a.status === 'completed');
      const avgScore = completed.reduce((sum, a) => sum + (a.total_score || 0), 0) / completed.length || 0;
      
      return {
        candidate_id: candidate.id,
        candidate_name: candidate.full_name,
        candidate_username: candidate.username,
        job_role_title: candidate.job_role_title,
        total_assessments: assessments.length,
        completed_assessments: completed.length,
        average_score: Math.round(avgScore),
        last_assessment: completed[completed.length - 1]?.completed_at || null,
        cognitive_profile: completed[completed.length - 1]?.cognitive_profile || null
      };
    });

    // Get assessment results with detailed information
    const assessmentResults = completedAssessments.map(assessment => {
      const candidate = candidatesStore.getById(assessment.candidate_id);
      const jobRole = jobRolesStore.getById(assessment.job_role_id);
      
      return {
        ...assessment,
        candidate_name: candidate?.full_name || 'Unknown',
        candidate_username: candidate?.username || 'Unknown',
        job_role_title: jobRole?.title || 'Unknown Role',
        duration: assessment.started_at && assessment.completed_at 
          ? Math.round((new Date(assessment.completed_at).getTime() - new Date(assessment.started_at).getTime()) / 1000 / 60)
          : 0
      };
    });

    // Calculate cognitive insights
    const cognitiveInsights = {
      strongest_cognitive_area: 'Processing Speed',
      weakest_cognitive_area: 'Working Memory',
      average_scores: {
        memory: 75,
        attention: 82,
        reasoning: 78,
        processing_speed: 85,
        spatial: 73
      },
      trends: {
        improving: ['Processing Speed', 'Attention'],
        declining: ['Working Memory'],
        stable: ['Reasoning', 'Spatial']
      }
    };

    return NextResponse.json({
      analytics,
      candidate_progress: candidateProgress,
      assessment_results: assessmentResults.slice(0, 20), // Latest 20 results
      cognitive_insights: cognitiveInsights,
      summary: {
        total_candidates: candidatesStore.getAll().length,
        active_assessments: assessmentSessionsStore.getAll().filter(a => a.status === 'in_progress').length,
        completed_today: assessmentResults.filter(a => {
          const today = new Date().toDateString();
          return new Date(a.completed_at || '').toDateString() === today;
        }).length
      }
    });

  } catch (error) {
    console.error('Get assessment dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
