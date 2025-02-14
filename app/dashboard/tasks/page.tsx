'use client';

import Link from 'next/link';

export default function TasksPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#f5efdb1a] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#f5efdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-display text-[#f5efdb]">No Tasks Yet</h2>
          <p className="text-[#f5efdb99]">
            You don't have any tasks yet. Apply to a project first to start completing tasks and earning rewards.
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#f5efdb] text-[#2a2a28] hover:opacity-90 transition-all font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Browse Projects
        </Link>
      </div>
    </div>
  );
} 