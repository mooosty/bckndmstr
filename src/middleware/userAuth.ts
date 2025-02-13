import { NextRequest, NextResponse } from 'next/server';

export function userAuth<P extends Record<string, string>>(
  handler: (req: NextRequest, context: { params: P }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: P }) => {
    const userEmail = request.headers.get('authorization')?.split(' ')[1];

    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, context);
    } catch (error) {
      console.error('Error in protected route:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 