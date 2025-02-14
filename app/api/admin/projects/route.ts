import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const adminAccess = request.cookies.get('adminAccess');
    if (!adminAccess || adminAccess.value !== 'true') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    
    // Fetch all projects
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .select('title description status createdAt')
      .lean();

    // Transform projects for response
    const transformedProjects = projects.map(project => ({
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const adminAccess = request.cookies.get('adminAccess');
    if (!adminAccess || adminAccess.value !== 'true') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create new project
    const project = await Project.create({
      ...body,
      status: body.status || 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: project._id.toString(),
        title: project.title,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 