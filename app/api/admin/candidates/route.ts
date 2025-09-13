import { NextRequest, NextResponse } from 'next/server';
import { candidatesStore } from '@/lib/data/candidates';

export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const candidates = candidatesStore.getAll();
    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new candidate with enhanced auto-generation
    const candidateData = {
      full_name: body.full_name || body.fullName,
      email: body.email || '',
      job_role_id: body.job_role_id || body.jobRoleId || '1',
      company_id: body.company_id || 'comp_1' // Default company for demo
    };

    const newCandidate = await candidatesStore.create(candidateData);

    // Return candidate with credentials for display
    return NextResponse.json({
      ...newCandidate,
      message: 'Candidate created successfully with auto-generated credentials and AI assessment'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}
