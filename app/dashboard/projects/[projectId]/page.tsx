'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';
import ApplyPopup from '@/app/components/ApplyPopup';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'COMING_SOON' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  tasks: number;
  applications: number;
  hasApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const { user } = useDynamicContext();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/projects/${params.projectId}`, {
          headers: {
            'Authorization': `Bearer ${user.email}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project details');
        }

        const data = await response.json();
        console.log('Project details response:', data);
        
        if (data.success) {
          // Transform the project data to match our interface
          const transformedProject = {
            id: data.project._id,
            title: data.project.title,
            description: data.project.description,
            imageUrl: data.project.imageUrl,
            status: data.project.status || 'OPEN', // Default to OPEN if not specified
            tasks: data.project.tasks?.length || 0,
            applications: data.project.applications?.length || 0,
            hasApplied: false, // We'll need to implement this check
            createdAt: data.project.createdAt,
            updatedAt: data.project.updatedAt
          };
          console.log('Transformed project:', transformedProject);
          setProject(transformedProject);
        } else {
          throw new Error(data.error || 'Failed to fetch project details');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchProject();
    }
  }, [user, mounted, params.projectId]);

  const handleApplySubmit = async (answers: string[]) => {
    if (!user?.email) return;

    const response = await fetch(`/api/projects/${params.projectId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.email}`
      },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit application');
    }

    // Update local state to reflect that user has applied
    setProject(project => project ? { ...project, hasApplied: true } : null);
  };

  if (!mounted) {
    return null;
  }

  const statusColors = {
    'COMING_SOON': 'text-[#f5efdb] bg-[#f5efdb1a] border-[#f5efdb33]',
    'OPEN': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'IN_PROGRESS': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'COMPLETED': 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a18] via-[#2a2a28] to-[#1a1a18]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Back Navigation */}
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center text-[#f5efdb99] hover:text-[#f5efdb] transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl p-6 bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            <div className="animate-pulse rounded-2xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-8">
              <div className="h-8 bg-[#f5efdb1a] rounded-xl w-1/3 mb-4" />
              <div className="h-48 bg-[#f5efdb1a] rounded-xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-[#f5efdb1a] rounded w-3/4" />
                <div className="h-4 bg-[#f5efdb1a] rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : project ? (
          <div className="space-y-8">
            {/* Project Header Card */}
            <div className="rounded-2xl backdrop-blur-xl bg-[#2a2a2833] border border-[#f5efdb1a] overflow-hidden">
              {/* Hero Image Section */}
              <div className="relative h-64 md:h-96">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18] via-transparent" />
                
                {/* Project Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-[#f5efdb]">
                      {project.title}
                    </h1>
                    <span className={`px-4 py-2 rounded-xl text-sm border ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-8 space-y-8">
                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-[#f5efdb99]">{project.description}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-[#2a2a2855] p-6 border border-[#f5efdb1a]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-[#f5efdb1a]">
                        <svg className="w-6 h-6 text-[#f5efdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-[#f5efdb99]">Total Tasks</div>
                        <div className="text-2xl font-display text-[#f5efdb]">{project.tasks}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-[#2a2a2855] p-6 border border-[#f5efdb1a]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-[#f5efdb1a]">
                        <svg className="w-6 h-6 text-[#f5efdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-[#f5efdb99]">Applications</div>
                        <div className="text-2xl font-display text-[#f5efdb]">{project.applications}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {project.status === 'OPEN' && (
                    project.hasApplied ? (
                      <button 
                        disabled
                        className="flex-1 px-6 py-4 rounded-xl bg-[#f5efdb33] text-[#f5efdb99] font-medium cursor-not-allowed
                          flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Application Submitted
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowApplyPopup(true)}
                        className="flex-1 px-6 py-4 rounded-xl bg-[#f5efdb] text-[#2a2a28] font-medium 
                          hover:opacity-95 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Apply Now
                      </button>
                    )
                  )}
                  <button 
                    className="flex-1 px-6 py-4 rounded-xl border border-[#f5efdb33] text-[#f5efdb] font-medium 
                      hover:bg-[#f5efdb1a] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    View Tasks
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f5efdb1a] mb-4">
              <svg className="h-8 w-8 text-[#f5efdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-[#f5efdb] mb-2">Project Not Found</h3>
            <p className="text-[#f5efdb99]">The project you're looking for doesn't exist or has been removed.</p>
          </div>
        )}
      </div>

      {/* Apply Popup */}
      {showApplyPopup && (
        <ApplyPopup
          projectId={params.projectId}
          onClose={() => setShowApplyPopup(false)}
          onSubmit={handleApplySubmit}
        />
      )}
    </div>
  );
} 