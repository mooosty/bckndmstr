import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/src/models/Project';

export async function GET(request: NextRequest) {
  // Log headers for debugging
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  // Check for authorization header
  const authHeader = request.headers.get('authorization');
  console.log('Auth Header:', authHeader);
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Authentication required',
      received_header: authHeader
    }, { status: 401 });
  }

  // Get email from Bearer token
  const userEmail = authHeader.split(' ')[1];
  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ 
      error: 'Invalid authentication token',
      received_email: userEmail
    }, { status: 401 });
  }

  try {
    await dbConnect();
    const projects = await Project.find().sort({ createdAt: -1 });
    
    // Transform projects to include id
    const transformedProjects = projects.map(project => {
      const plainProject = project.toObject();
      return {
        id: plainProject._id.toString(),
        title: plainProject.title,
        description: plainProject.description,
        imageUrl: plainProject.imageUrl,
        status: plainProject.status,
        createdAt: plainProject.createdAt,
        updatedAt: plainProject.updatedAt
      };
    });

    return NextResponse.json({ 
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch projects' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for admin access
    const adminAccess = request.cookies.get('adminAccess')?.value;
    if (!adminAccess || adminAccess !== 'true') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify admin email
    const adminEmail = authHeader.split(' ')[1];
    if (adminEmail !== 'admin@darknightlabs.com') {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    
    // Create new project in database
    const project = await Project.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Project created successfully",
      project: {
        id: project._id,
        ...data
      }
    });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create project' 
    }, { status: 500 });
  }
} 