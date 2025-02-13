import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('Admin login attempt...');
    const body = await request.json();
    console.log('Request body:', { ...body, adminCode: '[REDACTED]' });

    if (!body.adminCode) {
      return NextResponse.json(
        { error: 'Admin code is required' },
        { status: 400 }
      );
    }

    // Check admin code
    if (body.adminCode !== process.env.ADMIN_ACCESS_CODE) {
      console.log('Invalid admin code provided');
      return NextResponse.json(
        { error: 'Invalid admin code' },
        { status: 401 }
      );
    }

    console.log('Admin code verified, setting cookie');
    
    // Set admin cookie
    const response = NextResponse.json({ success: true });
    cookies().set('adminAccess', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 