'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'COMING_SOON' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { user } = useDynamicContext();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Static ChronoForge project
  const staticProject: Project = {
    id: 'chronoforge-1',
    title: 'ChronoForge',
    description: 'ChronoForge is a Web3 multiplayer RPG with hack-and-slash combat, player-driven governance, and time-travel adventures',
    imageUrl: 'https://i.postimg.cc/jjrfn6Wk/photo-2025-02-14-01-42-38.jpg',
    status: 'COMING_SOON',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${user.email}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success) {
          // Combine static project with fetched projects
          const allProjects = [staticProject, ...data.data];
          setProjects(allProjects);
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        // If API fails, at least show the static project
        setProjects([staticProject]);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchProjects();
    }
  }, [user, mounted]);

  if (!mounted) {
    return null;
  }

  const filteredProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(project => 
      statusFilter === 'all' ? true : project.status === statusFilter
    );

  const statusColors = {
    'COMING_SOON': 'text-[#f5efdb] bg-[#f5efdb1a] border-[#f5efdb33]',
    'OPEN': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'IN_PROGRESS': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'COMPLETED': 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a18] via-[#2a2a28] to-[#1a1a18]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section with Gradient Text */}
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5efdb] to-[#a39b7d]">
              Explore Projects
            </span>
          </h1>
          <p className="mt-2 text-[#f5efdb99] max-w-2xl">
            Discover and join innovative blockchain projects. Apply your skills and be part of the future.
          </p>
        </div>

        {/* Enhanced Filters Section */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search Input with Icon */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#f5efdb66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#2a2a2866] border border-[#f5efdb1a] text-[#f5efdb] 
                  placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33] focus:ring-1 focus:ring-[#f5efdb33]
                  transition-all duration-200"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['all', 'COMING_SOON', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-[#f5efdb] text-[#2a2a28] shadow-lg shadow-[#f5efdb]/10'
                      : 'border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]'
                  }`}
                >
                  {status === 'all' ? 'All Projects' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

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

        {/* Projects Grid with Enhanced Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6 h-[400px]">
                <div className="h-48 bg-[#f5efdb1a] rounded-xl mb-4" />
                <div className="h-6 bg-[#f5efdb1a] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#f5efdb1a] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f5efdb1a] mb-4">
              <svg className="h-8 w-8 text-[#f5efdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-[#f5efdb] mb-2">No Projects Available</h3>
            <p className="text-[#f5efdb99]">Check back soon for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group rounded-2xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6 
                  transition-all duration-200 hover:bg-[#2a2a2855] hover:border-[#f5efdb33]"
              >
                {/* Project Image with Overlay */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Project Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-display text-[#f5efdb] group-hover:text-white transition-colors">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[#f5efdb99] line-clamp-2 group-hover:text-[#f5efdb] transition-colors">
                    {project.description}
                  </p>

                  {/* View Details Button */}
                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[#f5efdb] font-medium group-hover:text-white transition-colors">
                      View Details
                    </span>
                    <svg 
                      className="w-5 h-5 text-[#f5efdb] transform transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 