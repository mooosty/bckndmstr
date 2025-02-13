import { NextRequest, NextResponse } from 'next/server';
import { projectController } from '../../../controllers/projectController';
import { userAuth } from '../../../middleware/userAuth';
import { adminAuth } from '../../../middleware/adminAuth';
import dbConnect from '@/lib/db';

// Connect to database
dbConnect();

// List projects (requires user auth)
export const GET = userAuth(async (request: NextRequest, context: { params: {} }) => {
  return projectController.getAll();
});

// Create project (requires admin auth)
export const POST = adminAuth(async (request: NextRequest) => {
  return projectController.create(request);
}); 