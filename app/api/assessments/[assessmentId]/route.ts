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

    console.log('API Route - Cookie token:', cookieToken ? 'Present' : 'Not found');
    console.log('API Route - Header token:', headerToken ? 'Present' : 'Not found');
    console.log('API Route - All cookies:', request.cookies.getAll());
    console.log('API Route - All headers:', Object.fromEntries(request.headers.entries()));

    const token = cookieToken || headerToken;

    if (!token) {
      console.log('API Route - No token found, returning 401');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const { assessmentId } = params;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    // First try to get from mock data
    const mockAssessment = assessmentSessionsStore.getById(assessmentId);
    if (mockAssessment) {
      console.log('API Route - Found assessment in mock data:', assessmentId);
      return NextResponse.json(mockAssessment);
    }

    console.log('API Route - Assessment not found in mock data, trying backend');

    // If not in mock data, try backend with authentication

    // Fetch specific assessment from backend
    const response = await fetch(`${BACKEND_URL}/assessments/${assessmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Route - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend get assessment error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const assessment = await response.json();
    console.log('API Route - Assessment fetched successfully');

    // Return the assessment data
    return NextResponse.json(assessment);

  } catch (error) {
    console.error('Get assessment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    // Get auth token from cookie or header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const { assessmentId } = params;
    const updates = await request.json();

    // Update assessment via backend (backend uses PATCH for candidates)
    const response = await fetch(`${BACKEND_URL}/assessments/${assessmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend update assessment error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const updatedAssessment = await response.json();
    return NextResponse.json(updatedAssessment);
    
  } catch (error) {
    console.error('Update assessment error:', error);
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}
