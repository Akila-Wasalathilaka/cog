import { NextRequest, NextResponse } from 'next/server';
import { assessmentSessionsStore } from '@/lib/data/assessments';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    // Get auth token from cookie or header
    const cookieToken = request.cookies.get('accessToken')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');

    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const assessmentId = params.assessmentId;

    // First try to get from mock data
    const mockAssessment = assessmentSessionsStore.getById(assessmentId);
    if (mockAssessment) {
      // Check if the assessment is completed
      if (mockAssessment.status !== 'completed') {
        return NextResponse.json(
          { error: 'Assessment is not completed yet' },
          { status: 400 }
        );
      }

      // Return the assessment results
      const result = {
        id: mockAssessment.id,
        candidate_id: mockAssessment.candidate_id,
        job_role_id: mockAssessment.job_role_id,
        status: mockAssessment.status,
        total_score: mockAssessment.total_score,
        completed_at: mockAssessment.completed_at,
        game_results: mockAssessment.cognitive_games || []
      };

      return NextResponse.json(result);
    }

    // If not in mock data, try backend with authentication
    const response = await fetch(`${BACKEND_URL}/assessments/${assessmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend get assessment error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const assessment = await response.json();

    // Check if the assessment is completed
    if (assessment.status !== 'COMPLETED' && assessment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Assessment is not completed yet' },
        { status: 400 }
      );
    }

    // Return the assessment results
    const result = {
      id: assessment.id,
      candidate_id: assessment.candidate_id,
      job_role_id: assessment.job_role_id,
      status: assessment.status,
      total_score: assessment.total_score,
      completed_at: assessment.completed_at,
      game_results: assessment.cognitive_games || []
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get assessment results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment results' },
      { status: 500 }
    );
  }
}
