'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectFormData {
  title: string;
  description: string;
  imageUrl: string;
  status: 'COMING_SOON' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    imageUrl: '',
    status: 'COMING_SOON'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get admin email from cookie or use default admin email
      const adminEmail = 'admin@darknightlabs.com';

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminEmail}`,
          'Cookie': 'adminAccess=true'
        },
        credentials: 'include', // This is important to include cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      // Redirect to projects list
      router.push('/admin/dashboard/projects');
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display text-[#f5efdb]">Create New Project</h1>
        <Link
          href="/admin/dashboard/projects"
          className="px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a] transition-all"
        >
          Back to Projects
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm text-[#f5efdb] mb-2">
                Project Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1c] border border-[#f5efdb1a] text-[#f5efdb] placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33]"
                placeholder="Enter project title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm text-[#f5efdb] mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1c] border border-[#f5efdb1a] text-[#f5efdb] placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33] min-h-[150px] resize-none"
                placeholder="Enter project description"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm text-[#f5efdb] mb-2">
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1c] border border-[#f5efdb1a] text-[#f5efdb] placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33]"
                placeholder="Enter image URL"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm text-[#f5efdb] mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1c] border border-[#f5efdb1a] text-[#f5efdb] focus:outline-none focus:border-[#f5efdb33]"
                required
              >
                <option value="COMING_SOON">Coming Soon</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-[#f5efdb33] text-[#f5efdb99] cursor-not-allowed'
                : 'bg-[#f5efdb] text-[#2a2a28] hover:opacity-90'
            }`}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
} 