import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function adminAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const cookieStore = cookies();
    const adminAccess = cookieStore.get('adminAccess');

    if (!adminAccess || adminAccess.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    try {
      return await handler(request);
    } catch (error) {
      console.error('Error in admin protected route:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 