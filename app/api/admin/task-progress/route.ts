import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TaskProgress from '@/src/models/TaskProgress';
import Project from '@/src/models/Project';
import User from '@/src/models/User';

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

    // Get all task progress entries
    const taskProgressList = await TaskProgress.find();

    // Get unique project IDs and user IDs using Object.keys and reduce
    const projectIds = Object.keys(
      taskProgressList.reduce((acc, tp) => {
        acc[tp.projectId] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    const userIds = Object.keys(
      taskProgressList.reduce((acc, tp) => {
        acc[tp.userId] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    // Fetch all related projects and users
    const [projects, users] = await Promise.all([
      Project.find({ _id: { $in: projectIds } }),
      User.find({ email: { $in: userIds } })
    ]);

    // Create maps for quick lookups
    const projectMap = new Map(projects.map(p => [p._id.toString(), p]));
    const userMap = new Map(users.map(u => [u.email, u]));

    // Transform the data to include project and user details
    const transformedProgress = taskProgressList.flatMap(progress => {
      const project = projectMap.get(progress.projectId);
      if (!project) return [];

      return progress.tasks.map(task => {
        // Find the task details from the project
        const taskDetails = project.tasks.discord.tasks.find(t => t.id === task.taskId) ||
                          project.tasks.social.tasks.find(t => t.id === task.taskId);
        if (!taskDetails) return null;

        return {
          taskId: task.taskId,
          projectId: progress.projectId,
          projectName: project.name,
          userId: progress.userId,
          userEmail: progress.userId,
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
      data: transformedProgress
    });
  } catch (error) {
    console.error('Error fetching task progress:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch task progress',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    const { taskId, projectId, userId, action } = await request.json();

    if (!taskId || !projectId || !userId || !action) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: taskId, projectId, userId, action' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid action. Must be either "approve" or "reject"' 
      }, { status: 400 });
    }

    // Find the task progress
    const progress = await TaskProgress.findOne({
      projectId,
      userId
    });

    if (!progress) {
      return NextResponse.json({ 
        success: false,
        error: 'Task progress not found' 
      }, { status: 404 });
    }

    // Find the specific task
    const taskIndex = progress.tasks.findIndex(t => t.taskId === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ 
        success: false,
        error: 'Task not found in progress' 
      }, { status: 404 });
    }

    // Update the task status
    progress.tasks[taskIndex].status = action === 'approve' ? 'completed' : 'pending';
    if (action === 'approve') {
      progress.tasks[taskIndex].completedAt = new Date();
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      message: `Task ${action}d successfully`
    });
  } catch (error) {
    console.error('Error updating task progress:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update task progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 