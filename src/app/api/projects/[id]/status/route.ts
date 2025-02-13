import { NextRequest } from 'next/server';
import { projectController } from '../../../../../controllers/projectController';
import { adminAuth } from '../../../../../middleware/adminAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return adminAuth(async () => {
    return projectController.updateStatus(params.id, req);
  })(req);
} 