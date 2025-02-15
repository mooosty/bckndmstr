import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '../utils/apiResponse';
import Project, { IProject } from '../models/Project';
import dbConnect from '@/lib/db';

class ProjectController {
  // Create a new project
  async create(req: NextRequest) {
    try {
      await dbConnect();
      const data = await req.json();
      console.log('Received project data:', JSON.stringify(data, null, 2));

      // Validate required fields
      const requiredFields = [
        'name',
        'coverImage',
        'overview.description',
        'nftDetails.title',
        'nftDetails.description',
        'mintDetails.chain',
        'mintDetails.supply',
        'mintDetails.mintDate'
      ];

      for (const field of requiredFields) {
        const value = field.split('.').reduce((obj, key) => obj?.[key], data);
        if (!value) {
          console.log(`Missing required field: ${field}`);
          return apiResponse.badRequest(`${field} is required`);
        }
      }

      // Create project with defaults for optional fields
      const projectData = {
        ...data,
        status: data.status || 'COMING_SOON',
        tags: data.tags || [],
        nftDetails: {
          ...data.nftDetails,
          features: data.nftDetails?.features || []
        },
        mintDetails: {
          ...data.mintDetails,
          phases: data.mintDetails?.phases || []
        },
        howToMint: {
          steps: data.howToMint?.steps || []
        },
        importantLinks: data.importantLinks || [],
        collaboration: {
          enabled: data.collaboration?.enabled || false,
          title: data.collaboration?.title || 'Want to collaborate?',
          description: data.collaboration?.description || 'Submit your application to become a partner',
          disabledMessage: data.collaboration?.disabledMessage || 'You can\'t collaborate until project is live'
        }
      };

      console.log('Processed project data:', JSON.stringify(projectData, null, 2));

      const project = await Project.create(projectData);
      console.log('Created project:', project);
      
      return apiResponse.success(project, 'Project created successfully');
    } catch (error) {
      console.error('Project creation error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        if ('errors' in error) {
          console.error('Validation errors:', error.errors);
        }
      }
      return apiResponse.serverError(error);
    }
  }

  // Get all projects
  async getAll() {
    try {
      await dbConnect();
      const projects = await Project.find({}).sort({ createdAt: -1 });
      return apiResponse.success(projects);
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Get a single project by ID
  async getById(id: string) {
    try {
      await dbConnect();
      const project = await Project.findById(id);
      if (!project) {
        return apiResponse.notFound('Project not found');
      }
      return apiResponse.success(project);
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Update a project
  async update(id: string, req: NextRequest) {
    try {
      await dbConnect();
      const data = await req.json();
      
      const project = await Project.findById(id);
      if (!project) {
        return apiResponse.notFound('Project not found');
      }

      // Update only the fields that are provided
      const updateData = {
        ...data,
        nftDetails: data.nftDetails ? {
          ...project.nftDetails,
          ...data.nftDetails
        } : project.nftDetails,
        mintDetails: data.mintDetails ? {
          ...project.mintDetails,
          ...data.mintDetails
        } : project.mintDetails,
        howToMint: data.howToMint ? {
          ...project.howToMint,
          ...data.howToMint
        } : project.howToMint,
        collaboration: data.collaboration ? {
          ...project.collaboration,
          ...data.collaboration
        } : project.collaboration
      };

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return apiResponse.success(updatedProject, 'Project updated successfully');
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }

  // Delete a project
  async delete(id: string) {
    try {
      await dbConnect();
      const project = await Project.findByIdAndDelete(id);
      if (!project) {
        return apiResponse.notFound('Project not found');
      }
      return apiResponse.success(null, 'Project deleted successfully');
    } catch (error) {
      return apiResponse.serverError(error);
    }
  }
}

export default new ProjectController(); 