import { NextRequest, NextResponse } from 'next/server';
import { jobRolesStore } from '@/lib/data/job-roles';

export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const jobRoles = jobRolesStore.getAll();
    return NextResponse.json(jobRoles);
  } catch (error) {
    console.error('Job roles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch job roles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' }, 
        { status: 400 }
      );
    }
    
    // Check if job role with same title already exists
    const existingJobRole = jobRolesStore.getByTitle(body.title);
    if (existingJobRole) {
      return NextResponse.json(
        { error: 'Job role with this title already exists' }, 
        { status: 409 }
      );
    }
    
    const newJobRole = jobRolesStore.add({
      company_id: body.company_id || 'comp_1', // Default company for now
      title: body.title,
      description: body.description,
      cognitive_requirements: body.cognitive_requirements || {
        memory: 3,
        attention: 3,
        reasoning: 3,
        processing_speed: 3,
        spatial: 3
      }
    });
    
    return NextResponse.json(newJobRole, { status: 201 });
  } catch (error) {
    console.error('Job roles POST error:', error);
    return NextResponse.json({ error: 'Failed to create job role' }, { status: 500 });
  }
}
