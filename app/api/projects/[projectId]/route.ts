import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';


export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    console.log(params.projectId)
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    await dbConnect();

    // Get user email from auth header
    const authHeader = request.headers.get('authorization');
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    console.log(authHeader)
    console.log('--------------------------')
    console.log('--------------------------')
    console.log('--------------------------')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const userEmail = authHeader.split(' ')[1];
    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.projectId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid project ID format'
      }, { status: 400 });
    }

    // Find project
    const project = await Project.findById(new mongoose.Types.ObjectId(params.projectId)).exec();
    if (!project) {
      return NextResponse.json({
        success: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch project',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*'
    },
  });
} 