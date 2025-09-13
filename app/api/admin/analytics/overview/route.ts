import { NextRequest, NextResponse } from 'next/server';
import { candidatesStore } from '@/lib/data/candidates';
import { jobRolesStore } from '@/lib/data/job-roles';
import { assessmentSessionsStore } from '@/lib/data/assessments';

export async function GET(_request: NextRequest) {
  try {
    // Get all candidates
    const candidates = candidatesStore.getAll();

    // Calculate stats
    const totalCandidates = candidates.length;
    const activeCandidates = candidates.filter(c => c.is_active).length;

    // Get all assessments
    const assessments = assessmentSessionsStore.getAll();
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => a.status === 'completed').length;

    // Get job roles count
    const jobRoles = jobRolesStore.getAll();
    const totalJobRoles = jobRoles.length;

    const stats = {
      totalCandidates,
      activeCandidates,
      totalAssessments,
      completedAssessments,
      totalJobRoles
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics overview error:', error);
    // Return fallback data
    return NextResponse.json({
      totalCandidates: 0,
      activeCandidates: 0,
      totalAssessments: 0,
      completedAssessments: 0,
      totalJobRoles: 0
    });
  }
}