'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Application {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  answers: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer admin@darknightlabs.com`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        
        if (data.success) {
          setApplications(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications
    .filter(application => 
      statusFilter === 'all' ? true : application.status === statusFilter
    );

  const statusColors = {
    'PENDING': 'text-yellow-400 bg-yellow-400/10',
    'APPROVED': 'text-green-400 bg-green-400/10',
    'REJECTED': 'text-red-400 bg-red-400/10'
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer admin@darknightlabs.com`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display text-[#f5efdb]">Applications</h1>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl p-4 backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a]">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-[#f5efdb] text-[#2a2a28]'
                  : 'border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6 h-[200px]" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#f5efdb99]">No applications available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-display text-[#f5efdb] mb-1">
                      Application for {application.projectTitle}
                    </h3>
                    <p className="text-sm text-[#f5efdb66]">
                      By {application.userId} • {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[application.status]}`}>
                    {application.status}
                  </span>
                </div>

                {/* Answers */}
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm text-[#f5efdb99] mb-1">Why are you interested in this project?</h4>
                    <p className="text-[#f5efdb]">{application.answers[0]}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-[#f5efdb99] mb-1">What relevant experience do you have?</h4>
                    <p className="text-[#f5efdb]">{application.answers[1]}</p>
                  </div>
                </div>

                {/* Actions */}
                {application.status === 'PENDING' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleStatusChange(application.id, 'APPROVED')}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(application.id, 'REJECTED')}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 