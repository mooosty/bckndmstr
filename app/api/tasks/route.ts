import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/src/models/Project';
import User from '@/src/models/User';
import TaskProgress from '@/src/models/TaskProgress';

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

export async function GET(req: Request) {
  try {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = authHeader.split(' ')[1];
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // If admin, fetch all task progress
    if (userEmail === 'admin@darknightlabs.com') {
      const taskProgressList = await TaskProgress.find();
      const projectIds = [...new Set(taskProgressList.map(tp => tp.projectId))];
      const projects = await Project.find({ _id: { $in: projectIds } });
      const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));

      const tasks = taskProgressList.flatMap(progress => {
        return progress.tasks.map(task => {
          // Find the corresponding project
          const project = projects.find(p => p._id.toString() === progress.projectId);
          if (!project) return null;

          // Find the task details from the project
          const taskDetails = project.tasks.discord.tasks.find(t => t.id === task.taskId) ||
                            project.tasks.social.tasks.find(t => t.id === task.taskId);
          if (!taskDetails) return null;

          return {
            taskId: task.taskId,
            projectId: progress.projectId,
            projectName: projectMap.get(progress.projectId) || 'Unknown Project',
            title: taskDetails.title,
            description: taskDetails.description,
            type: task.type,
            status: task.status,
            points: taskDetails.points,
            dueDate: taskDetails.dueDate,
            submission: task.submission,
            completedAt: task.completedAt,
            subtasks: taskDetails.subtasks?.map(subtask => ({
              subtaskId: subtask.id,
              title: subtask.title,
              completed: task.subtasks?.find(s => s.subtaskId === subtask.id)?.completed || false,
              required: subtask.required
            }))
          };
        }).filter(Boolean);
      });

      return NextResponse.json({
        success: true,
        data: tasks
      });
    }

    // For regular users, find their task progress
    const taskProgressList = await TaskProgress.find({ userId: userEmail });

    // Get all unique project IDs from the task progress
    const projectIds = [...new Set(taskProgressList.map(tp => tp.projectId))];

    // Fetch all projects
    const projects = await Project.find({ _id: { $in: projectIds } });

    // Create a map of project IDs to project names
    const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));

    // Transform the data to include project names and all task details
    const tasks = taskProgressList.flatMap(progress => {
      return progress.tasks.map(task => {
        // Find the corresponding project
        const project = projects.find(p => p._id.toString() === progress.projectId);
        if (!project) return null;

        // Find the task details from the project
        const taskDetails = project.tasks.discord.tasks.find(t => t.id === task.taskId) ||
                          project.tasks.social.tasks.find(t => t.id === task.taskId);
        if (!taskDetails) return null;

        return {
          taskId: task.taskId,
          projectId: progress.projectId,
          projectName: projectMap.get(progress.projectId) || 'Unknown Project',
          title: taskDetails.title,
          description: taskDetails.description,
          type: task.type,
          status: task.status,
          points: taskDetails.points,
          dueDate: taskDetails.dueDate,
          submission: task.submission,
          completedAt: task.completedAt,
          subtasks: taskDetails.subtasks?.map(subtask => ({
            subtaskId: subtask.id,
            title: subtask.title,
            completed: task.subtasks?.find(s => s.subtaskId === subtask.id)?.completed || false,
            required: subtask.required
          }))
        };
      }).filter(Boolean); // Remove null values
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 