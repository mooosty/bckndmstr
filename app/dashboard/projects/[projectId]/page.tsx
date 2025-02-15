'use client';
 
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  coverImage: string;
  status: 'COMING_SOON' | 'LIVE' | 'ENDED';
  tags: string[];
  overview: {
    description: string;
  };
  nftDetails: {
    title: string;
    description: string;
    features: string[];
  };
  mintDetails: {
    chain: string;
    supply: string;
    mintDate: string;
    phases: {
      name: string;
      duration: string;
      time: string;
    }[];
  };
  howToMint: {
    steps: string[];
  };
  importantLinks: {
    title: string;
    url: string;
    icon: string;
  }[];
  collaboration: {
    enabled: boolean;
    title: string;
    description: string;
    disabledMessage: string;
  };
  tasks: {
    discord: {
      title: string;
      description: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        points: number;
        dueDate: string;
        subtasks?: {
          id: string;
          title: string;
          required: boolean;
        }[];
      }[];
      progress: number;
    };
    social: {
      title: string;
      description: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        points: number;
        dueDate: string;
      }[];
      progress: number;
    };
  };
}

interface TaskProgress {
  userId: string;
  projectId: string;
  tasks: {
    taskId: string;
    type: 'discord' | 'social';
    status: 'pending' | 'pending_approval' | 'completed';
    completedAt?: string;
    submission?: string;
    subtasks?: {
      subtaskId: string;
      completed: boolean;
      completedAt?: string;
    }[];
  }[];
  totalPoints: number;
  completedTasks: number;
}

interface TaskProgressResponse {
  discord?: {
    tasks: Array<{
      id: string;
      progress?: {
        status: 'pending' | 'completed';
        completedAt?: string;
        submission?: string;
        subtasks?: Array<{
          subtaskId: string;
          completed: boolean;
          completedAt?: string;
        }>;
      };
      subtasks?: Array<{
        id: string;
      }>;
    }>;
  };
  social?: {
    tasks: Array<{
      id: string;
      progress?: {
        status: 'pending' | 'completed';
        completedAt?: string;
        submission?: string;
      };
    }>;
  };
  totalPoints: number;
  completedTasks: number;
}

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    type: 'discord' | 'social';
    points: number;
  };
}
 
const TaskSubmissionModal = ({ isOpen, onClose, task, onTaskSubmitted }: TaskSubmissionModalProps & { onTaskSubmitted: (updatedProgress: TaskProgress) => void }) => {
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useDynamicContext();
  const params = useParams();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${params.projectId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify({
          taskId: task.id,
          type: task.type,
          submission: submission
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit task');
      }

      const data = await response.json();
      if (data.success) {
        onTaskSubmitted(data.data);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
          <Dialog.Title className="text-xl font-display text-[#f5efdb] mb-4">
            Submit Task: {task.title}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#f5efdb99] text-sm mb-2">
                {task.type === 'discord' ? 'Discord Username' : 'Post Link'}
              </label>
              <input
                type="text"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#2a2a2866] border border-[#f5efdb1a] text-[#f5efdb] placeholder-[#f5efdb66] focus:outline-none focus:border-[#f5efdb33]"
                placeholder={task.type === 'discord' ? 'Enter your Discord username' : 'Paste your post link'}
                required
                disabled={submitting}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 text-sm">+{task.points} pts</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#f5efdb] text-[#2a2a28] hover:opacity-90 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
 
export default function ProjectDetailsPage() {
  const { user } = useDynamicContext();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<null | {
    id: string;
    title: string;
    type: 'discord' | 'social';
    points: number;
  }>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
 
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email || !params.projectId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${params.projectId}`, {
          headers: {
            'Authorization': `Bearer ${user.email}`
          }
        });

        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project details');
        }

        const projectData = await projectResponse.json();
        console.log('Project Data:', projectData);
        
        if (projectData.success) {
          setProject(projectData.data);
          
          // Fetch task progress
          const progressResponse = await fetch(`/api/projects/${params.projectId}/progress`, {
            headers: {
              'Authorization': `Bearer ${user.email}`
            }
          });

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log('Progress Data:', progressData);
            
            if (progressData.success) {
              const data = progressData.data as TaskProgressResponse;
              
              // Transform the data structure to match what the component expects
              const transformedProgress: TaskProgress = {
                userId: user.email,
                projectId: params.projectId as string,
                tasks: [
                  ...(data.discord?.tasks || []).map((task: { id: string; progress?: { status: 'pending' | 'completed'; completedAt?: string; submission?: string; subtasks?: Array<{ subtaskId: string; completed: boolean; completedAt?: string; }>; }; subtasks?: Array<{ id: string; }>; }) => ({
                    taskId: task.id,
                    type: 'discord' as const,
                    status: task.progress?.status || 'pending',
                    completedAt: task.progress?.completedAt,
                    submission: task.progress?.submission,
                    subtasks: task.subtasks?.map((subtask: { id: string }) => ({
                      subtaskId: subtask.id,
                      completed: task.progress?.subtasks?.find((s: { subtaskId: string }) => s.subtaskId === subtask.id)?.completed || false,
                      completedAt: task.progress?.subtasks?.find((s: { subtaskId: string }) => s.subtaskId === subtask.id)?.completedAt
                    }))
                  })),
                  ...(data.social?.tasks || []).map((task: { id: string; progress?: { status: 'pending' | 'completed'; completedAt?: string; submission?: string; }; }) => ({
                    taskId: task.id,
                    type: 'social' as const,
                    status: task.progress?.status || 'pending',
                    completedAt: task.progress?.completedAt,
                    submission: task.progress?.submission
                  }))
                ],
                totalPoints: data.totalPoints || 0,
                completedTasks: data.completedTasks || 0
              };
              
              console.log('Transformed Progress:', transformedProgress);
              setTaskProgress(transformedProgress);
            }
          }
        } else {
          throw new Error(projectData.error || 'Failed to fetch project details');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, params.projectId]);

  const handleTaskClick = (task: { 
    id: string;
    title: string; 
    type: 'discord' | 'social'; 
    points: number; 
  }) => {
    setSelectedTask(task);
  };

  const getTaskStatus = (taskId: string) => {
    if (!taskProgress) return 'pending';
    console.log('Task Progress:', taskProgress);
    console.log('Looking for task:', taskId);
    const task = taskProgress.tasks?.find(t => t.taskId === taskId);
    console.log('Found task:', task);
    return task?.status || 'pending';
  };

  const getSubtaskStatus = (taskId: string, subtaskId: string) => {
    if (!taskProgress) return false;
    const task = taskProgress.tasks?.find(t => t.taskId === taskId);
    return task?.subtasks?.find(st => st.subtaskId === subtaskId)?.completed || false;
  };

  const getTaskStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          size: 'w-3 h-3',
          tooltip: 'Completed'
        };
      case 'pending_approval':
        return {
          color: 'bg-yellow-500',
          size: 'w-3 h-3',
          tooltip: 'Pending Admin Approval'
        };
      default:
        return {
          color: 'bg-[#f5efdb33]',
          size: 'w-2 h-2',
          tooltip: 'Not Started'
        };
    }
  };

  const handleTaskSubmitted = (updatedProgress: TaskProgress) => {
    setTaskProgress(updatedProgress);
    // Update project progress percentages
    if (project) {
      const discordTasks = project.tasks.discord.tasks;
      const socialTasks = project.tasks.social.tasks;
      
      const discordCompleted = discordTasks.filter(task => 
        updatedProgress.tasks.find(t => t.taskId === task.id && (t.status === 'completed' || t.status === 'pending_approval'))
      ).length;
      
      const socialCompleted = socialTasks.filter(task => 
        updatedProgress.tasks.find(t => t.taskId === task.id && (t.status === 'completed' || t.status === 'pending_approval'))
      ).length;

      setProject({
        ...project,
        tasks: {
          ...project.tasks,
          discord: {
            ...project.tasks.discord,
            progress: Math.round((discordCompleted / discordTasks.length) * 100)
          },
          social: {
            ...project.tasks.social,
            progress: Math.round((socialCompleted / socialTasks.length) * 100)
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a18] flex items-center justify-center">
        <div className="text-[#f5efdb] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5efdb] mx-auto mb-4"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a18] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 mb-4">{error}</div>
          <Link
            href="/dashboard/projects"
            className="inline-block px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#1a1a18] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[#f5efdb] mb-4">Project not found</div>
          <Link
            href="/dashboard/projects"
            className="inline-block px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#1a1a18]">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {/* Project Header */}
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden mb-8">
          <Image
            src={project.coverImage}
            alt={project.name}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-display text-[#f5efdb] mb-2">{project.name}</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm text-[#f5efdb] bg-[#f5efdb1a] border border-[#f5efdb33]">
                {project.status.replace('_', ' ')}
              </span>
              {project.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full text-sm text-purple-400 bg-purple-400/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
 
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Overview */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h2 className="text-2xl font-display text-[#f5efdb] mb-4">Overview</h2>
              <p className="text-[#f5efdb99] leading-relaxed">
                {project.overview.description}
              </p>
            </div>
 
            {/* NFT Details */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h2 className="text-2xl font-display text-[#f5efdb] mb-4">{project.nftDetails.title}</h2>
              <p className="text-[#f5efdb99] mb-4">
                {project.nftDetails.description}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#f5efdb99]">
                {project.nftDetails.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
 
            {/* How to Mint */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h2 className="text-2xl font-display text-[#f5efdb] mb-4">How to Mint</h2>
              <ol className="list-decimal list-inside space-y-2 text-[#f5efdb99]">
                {project.howToMint.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Tasks & Progress Section */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display text-[#f5efdb]">Tasks & Progress</h2>
                <span className="text-[#f5efdb99]">
                  {taskProgress ? (
                    `${taskProgress.completedTasks || 0}/${(project.tasks?.discord?.tasks?.length || 0) + (project.tasks?.social?.tasks?.length || 0)} Tasks Completed`
                  ) : '0/0 Tasks Completed'}
                </span>
              </div>

              {/* Discord Tasks */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">👾</span>
                    <h3 className="text-lg font-display text-[#f5efdb]">{project.tasks.discord.title}</h3>
                  </div>
                  <span className="text-[#f5efdb99]">{project.tasks.discord.progress}%</span>
                </div>

                {project.tasks.discord.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                    onClick={() => handleTaskClick({
                      id: task.id,
                      title: task.title,
                      type: 'discord',
                      points: task.points
                    })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center group relative">
                          {(() => {
                            const status = getTaskStatus(task.id);
                            const statusDisplay = getTaskStatusDisplay(status);
                            return (
                              <>
                                <div className={`rounded-full ${statusDisplay.color} ${statusDisplay.size}`}></div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#2a2a28] text-xs text-[#f5efdb] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  {statusDisplay.tooltip}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div>
                          <h4 className="text-[#f5efdb] font-medium">{task.title}</h4>
                          <p className="text-[#f5efdb99] text-sm">{task.description}</p>
                          
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {task.subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                  <div className="w-3 h-3 rounded-full border border-[#f5efdb33] flex items-center justify-center">
                                    {getSubtaskStatus(task.id, subtask.id) ? (
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    ) : (
                                      <div className="w-1 h-1 rounded-full bg-[#f5efdb33]"></div>
                                    )}
                                  </div>
                                  <span className={`${getSubtaskStatus(task.id, subtask.id) ? 'text-[#f5efdb99] line-through' : 'text-[#f5efdb]'}`}>
                                    {subtask.title}
                                  </span>
                                  {subtask.required && (
                                    <span className="text-[#f5efdb66]">(Required)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-yellow-400 text-sm">+{task.points} pts</span>
                        <span className="text-[#f5efdb66] text-sm">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">🐦</span>
                    <h3 className="text-lg font-display text-[#f5efdb]">{project.tasks.social.title}</h3>
                  </div>
                  <span className="text-[#f5efdb99]">{project.tasks.social.progress}%</span>
                </div>

                {project.tasks.social.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                    onClick={() => handleTaskClick({
                      id: task.id,
                      title: task.title,
                      type: 'social',
                      points: task.points
                    })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center group relative">
                          {(() => {
                            const status = getTaskStatus(task.id);
                            const statusDisplay = getTaskStatusDisplay(status);
                            return (
                              <>
                                <div className={`rounded-full ${statusDisplay.color} ${statusDisplay.size}`}></div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#2a2a28] text-xs text-[#f5efdb] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  {statusDisplay.tooltip}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div>
                          <h4 className="text-[#f5efdb] font-medium">{task.title}</h4>
                          <p className="text-[#f5efdb99] text-sm">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-yellow-400 text-sm">+{task.points} pts</span>
                        <span className="text-[#f5efdb66] text-sm">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Sidebar with Key Details */}
          <div className="lg:w-80 space-y-4">
            {/* Mint Details Card */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h3 className="text-lg font-display text-[#f5efdb] mb-4">Mint Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[#f5efdb99] text-sm">Chain</p>
                  <p className="text-[#f5efdb]">{project.mintDetails.chain}</p>
                </div>
                <div>
                  <p className="text-[#f5efdb99] text-sm">Supply</p>
                  <p className="text-[#f5efdb]">{project.mintDetails.supply}</p>
                </div>
                <div>
                  <p className="text-[#f5efdb99] text-sm">Mint Date</p>
                  <p className="text-[#f5efdb]">{project.mintDetails.mintDate}</p>
                </div>
              </div>
            </div>
 
            {/* Mint Phases Card */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h3 className="text-lg font-display text-[#f5efdb] mb-4">Mint Phases</h3>
              <div className="space-y-3">
                {project.mintDetails.phases.map((phase, index) => (
                  <div key={index}>
                    <p className="text-[#f5efdb99] text-sm">{phase.name}</p>
                    <p className="text-[#f5efdb]">{phase.duration} - {phase.time}</p>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Links Card */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h3 className="text-lg font-display text-[#f5efdb] mb-4">Important Links</h3>
              <div className="space-y-2">
                {project.importantLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#f5efdb] hover:opacity-80"
                  >
                    {link.icon} {link.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Apply Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a18]/80 backdrop-blur-md border-t border-[#f5efdb1a] p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div>
            <h3 className="text-[#f5efdb] font-display text-center sm:text-left">{project.collaboration.title}</h3>
            <p className="text-[#f5efdb99] text-center sm:text-left">{project.collaboration.description}</p>
          </div>
          <div className="relative group">
            <button 
              disabled={!project.collaboration.enabled}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg transition-all font-medium ${
                project.collaboration.enabled
                  ? 'bg-[#f5efdb] text-[#2a2a28] hover:opacity-90'
                  : 'bg-[#f5efdb33] text-[#f5efdb66] cursor-not-allowed'
              }`}
            >
              Collaborate Now
            </button>
            {!project.collaboration.enabled && (
              <div className="absolute bottom-full mb-2 w-48 p-2 bg-[#2a2a28] border border-[#f5efdb1a] rounded-lg text-[#f5efdb99] text-sm text-center
                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {project.collaboration.disabledMessage}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Add the Task Submission Modal */}
      {selectedTask && (
        <TaskSubmissionModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onTaskSubmitted={handleTaskSubmitted}
        />
      )}
    </div>
  );
} 