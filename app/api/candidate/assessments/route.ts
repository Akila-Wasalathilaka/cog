import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/assessments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend request failed' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch assessments' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Transform the backend response to match frontend expectations
    const transformedData = data.map((assessment: any) => ({
      id: assessment.id,
      status: assessment.status,
      candidate_id: assessment.candidate_id,
      job_role_id: assessment.job_role_id,
      job_role_title: assessment.job_role_title || 'Unknown Job Role',
      started_at: assessment.started_at,
      completed_at: assessment.completed_at,
      total_score: assessment.total_score,
      progress_percentage: assessment.progress_percentage || 0,
      cognitive_games: assessment.cognitive_games || [] // Pass through the cognitive_games from backend
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching candidate assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}