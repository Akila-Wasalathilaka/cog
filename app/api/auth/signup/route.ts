import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Company registration - create new company and admin user
export async function POST(request: NextRequest) {
  try {
    const { 
      companyName, 
      companyEmail, 
      companyDomain, 
      adminFullName, 
      adminEmail, 
      password
    } = await request.json();

    // Validate required fields
    if (!companyName || !companyEmail || !companyDomain || !adminFullName || !adminEmail || !password) {
      return NextResponse.json({ 
        error: 'All fields are required: Company Name, Company Email, Domain, Admin Name, Admin Email, Password' 
      }, { status: 400 });
    }

    // Validate email formats
    if (!companyEmail.includes('@') || !adminEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate company domain format
    if (!companyDomain.startsWith('@')) {
      return NextResponse.json({ 
        error: 'Company domain must start with @ (e.g., @yourcompany.com)' 
      }, { status: 400 });
    }

    // Check if admin email matches company domain
    const adminDomain = '@' + adminEmail.split('@')[1];
    if (adminDomain !== companyDomain) {
      return NextResponse.json({ 
        error: `Admin email must use company domain ${companyDomain}` 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    console.log(`🏢 Creating new company: ${companyName} with domain ${companyDomain}`);

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/auth/company/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: companyName,
        admin_full_name: adminFullName,
        email: adminEmail, // Use admin email as primary company contact
        password,
        domain: companyDomain
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Company signup failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`✅ Company created successfully via backend`);
    
    return NextResponse.json({
      success: true,
      message: 'Company registration successful! Please verify your email to activate your account.',
      ...data
    });

  } catch (error) {
    console.error('Company signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during company registration' 
    }, { status: 500 });
  }
}
