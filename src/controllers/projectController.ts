import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '../utils/apiResponse';
import Project, { IProject } from '../models/Project';
import dbConnect from '@/lib/db';

class ProjectController {
  // Create a new project
  async create(req: NextRequest) {
    try {
      const data = await req.json();
      const project = await Project.create(data);
      return apiResponse.success(project, 'Project created successfully');
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Get all projects
  async getAll() {
    try {
      const projects = await Project.find().sort({ createdAt: -1 });
      return apiResponse.success(projects);
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Get a single project
  async getOne(id: string) {
    try {
      const project = await Project.findById(id);
      if (!project) {
        return apiResponse.error('Project not found', 404);
      }
      return apiResponse.success(project);
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Update project status
  async updateStatus(id: string, req: NextRequest) {
    try {
      await dbConnect();
      const { status } = await req.json();

      if (!['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid status' 
        }, { status: 400 });
      }

      const project = await Project.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!project) {
        return NextResponse.json({ 
          success: false, 
          message: 'Project not found' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        project 
      });
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update project status' 
      }, { status: 500 });
    }
  }

  // Delete a project
  async delete(id: string) {
    try {
      const project = await Project.findByIdAndDelete(id);
      if (!project) {
        return apiResponse.error('Project not found', 404);
      }
      return apiResponse.success(null, 'Project deleted successfully');
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }
}

export const projectController = new ProjectController(); 