import { NextRequest, NextResponse } from 'next/server';
import { userAuth, isAdmin } from '@/middleware/userAuth';
import dbConnect from '@/lib/db';
import Application from '@/src/models/Application';

interface AuthResult {
  user: {
    email: string;
    role: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await userAuth(request);
    if (!('user' in authResult)) {
      return authResult as NextResponse;
    }

    const { user } = authResult as AuthResult;

    // Connect to database
    await dbConnect();

    // Query based on user role
    let applications;
    if (isAdmin(user)) {
      // Admin can see all applications
      applications = await Application.find()
        .sort({ createdAt: -1 })
        .populate('projectId', 'title status');
    } else {
      // Regular users can only see their own applications
      applications = await Application.find({ userId: user.email })
        .sort({ createdAt: -1 })
        .populate('projectId', 'title status');
    }

    // Transform applications for response
    const transformedApplications = applications.map(app => {
      const plainApp = app.toObject();
      return {
        id: plainApp._id.toString(),
        userId: plainApp.userId,
        projectId: plainApp.projectId._id.toString(),
        projectTitle: plainApp.projectId.title,
        answers: plainApp.answers,
        status: plainApp.status,
        createdAt: plainApp.createdAt,
        updatedAt: plainApp.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedApplications
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get applications'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await userAuth(request);
    if (!('user' in authResult)) {
      return authResult as NextResponse;
    }

    const { user } = authResult as AuthResult;

    // Get request body
    const data = await request.json();

    // Validate required fields
    if (!data.projectId || !data.answers) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Create application
    const application = await Application.create({
      userId: user.email,
      projectId: data.projectId,
      answers: data.answers,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        ...data
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit application'
    }, { status: 500 });
  }
} 