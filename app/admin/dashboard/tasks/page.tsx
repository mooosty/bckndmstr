'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectTitle: string;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer admin@darknightlabs.com`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        
        if (data.success) {
          setTasks(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(task => 
      statusFilter === 'all' ? true : task.status === statusFilter
    );

  const priorityColors = {
    'LOW': 'text-blue-400 bg-blue-400/10',
    'MEDIUM': 'text-yellow-400 bg-yellow-400/10',
    'HIGH': 'text-red-400 bg-red-400/10'
  };

  const statusColors = {
    'PENDING': 'text-yellow-400 bg-yellow-400/10',
    'IN_PROGRESS': 'text-blue-400 bg-blue-400/10',
    'COMPLETED': 'text-green-400 bg-green-400/10'
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display text-[#f5efdb]">Tasks</h1>
        <Link
          href="/admin/dashboard/tasks/new"
          className="px-4 py-2 rounded-lg bg-[#f5efdb] text-[#2a2a28] hover:opacity-90 transition-all"
        >
          Create New Task
        </Link>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl p-4 backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#2a2a2866] border border-[#f5efdb1a] text-[#f5efdb] placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-[#f5efdb] text-[#2a2a28]'
                    : 'border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6 h-[100px]" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#f5efdb99]">No tasks available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6 transition-all hover:bg-[#2a2a2855]"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-display text-[#f5efdb]">{task.title}</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#f5efdb99] mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#f5efdb66]">
                    <span>Project: {task.projectTitle}</span>
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/dashboard/tasks/${task.id}`}
                    className="px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a] transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 