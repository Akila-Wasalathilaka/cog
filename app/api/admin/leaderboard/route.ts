import { NextRequest, NextResponse } from 'next/server';
import { assessmentSessionsStore } from '@/lib/data/assessments';
import { candidatesStore } from '@/lib/data/candidates';
import { jobRolesStore } from '@/lib/data/job-roles';

export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Get leaderboard data
    const leaderboard = assessmentSessionsStore.getLeaderboard();
    
    // Enhance with candidate and job role information
    const enhancedLeaderboard = leaderboard.map(entry => {
      const candidate = candidatesStore.getById(entry.candidate_id);
      const jobRole = jobRolesStore.getById(entry.job_role_id);
      
      return {
        ...entry,
        candidate_name: candidate?.full_name || candidate?.username || 'Unknown',
        candidate_username: candidate?.username || 'Unknown',
        job_role_title: jobRole?.title || 'Unknown Role',
        rank: leaderboard.indexOf(entry) + 1
      };
    });

    // Get analytics data
    const analytics = assessmentSessionsStore.getAnalytics();

    return NextResponse.json({
      leaderboard: enhancedLeaderboard,
      analytics: {
        ...analytics,
        top_performers: enhancedLeaderboard.slice(0, 5),
        recent_assessments: enhancedLeaderboard.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
