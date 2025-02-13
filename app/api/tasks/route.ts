import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/src/models/Project';
import User from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting task creation...');
    
    // Check for admin access
    const adminAccess = request.cookies.get('adminAccess')?.value;
    console.log('Admin access:', adminAccess);
    
    if (!adminAccess || adminAccess !== 'true') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify admin email
    const adminEmail = authHeader.split(' ')[1];
    console.log('Admin email:', adminEmail);
    
    if (adminEmail !== 'admin@darknightlabs.com') {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    console.log('Task data received:', data);

    // Validate required fields
    if (!data.projectId || !data.title || !data.description || !data.deadline || !data.assignedTo) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields. Required: projectId, title, description, deadline, assignedTo' 
      }, { status: 400 });
    }

    // Verify project exists
    const project = await Project.findById(data.projectId);
    console.log('Project found:', project?._id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify assigned user exists
    const assignedUser = await User.findOne({ email: data.assignedTo });
    console.log('Assigned user found:', assignedUser?._id);

    if (!assignedUser) {
      return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
    }

    // Create new task in database
    const taskData = {
      ...data,
      userId: data.assignedTo, // Use the assigned user's email
      createdBy: adminEmail, // Track who created the task
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('Creating task with data:', taskData);
    
    const task = await Task.create(taskData);
    console.log('Task created successfully:', task._id);
    
    // Transform task for response
    const transformedTask = {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      projectId: task.projectId.toString(),
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
      assignedTo: task.userId,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };

    return NextResponse.json({ 
      success: true,
      message: "Task created successfully",
      data: transformedTask
    });
  } catch (error) {
    console.error('Task creation error details:', error);
    // Log validation errors if present
    if (error instanceof Error && 'errors' in (error as any)) {
      console.error('Validation errors:', (error as any).errors);
    }
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task',
      details: error instanceof Error ? error.stack : undefined,
      validationErrors: error instanceof Error && 'errors' in (error as any) ? (error as any).errors : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    const tasks = await Task.find()
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
    
    // Transform tasks to include id
    const transformedTasks = tasks.map(task => {
      const plainTask = task.toObject();
      return {
        id: plainTask._id.toString(),
        title: plainTask.title,
        description: plainTask.description,
        projectId: plainTask.projectId._id,
        projectTitle: plainTask.projectId.title,
        deadline: plainTask.deadline,
        priority: plainTask.priority,
        status: plainTask.status,
        assignedTo: plainTask.userId,
        createdBy: plainTask.createdBy,
        createdAt: plainTask.createdAt,
        updatedAt: plainTask.updatedAt
      };
    });

    return NextResponse.json({ 
      success: true,
      data: transformedTasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch tasks' 
    }, { status: 500 });
  }
} 