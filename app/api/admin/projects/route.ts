import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project, { IProject } from '@/src/models/Project';
import { Document } from 'mongoose';

export async function GET(request: NextRequest) {
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
    const projects = await Project.find().sort({ createdAt: -1 });

    // Transform projects for response
    const transformedProjects = projects.map((project: Document & IProject) => ({
      id: project._id.toString(),
      name: project.name,
      overview: {
        description: project.overview.description
      },
      coverImage: project.coverImage,
      status: project.status,
      tags: project.tags,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admin projects' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
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

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.overview?.description) {
      return NextResponse.json(
        { error: 'Name and overview description are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create new project
    const project = await Project.create({
      ...data,
      status: data.status || 'COMING_SOON',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: project._id.toString(),
        name: project.name,
        overview: {
          description: project.overview.description
        },
        coverImage: project.coverImage,
        status: project.status,
        tags: project.tags,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
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