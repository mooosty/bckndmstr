'use client';
 
import Image from 'next/image';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
 
interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    title: string;
    type: 'discord' | 'social';
    points: number;
  };
}
 
const TaskSubmissionModal = ({ isOpen, onClose, task }: TaskSubmissionModalProps) => {
  const [submission, setSubmission] = useState('');
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here
    console.log('Submitted:', { task, submission });
    onClose();
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
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 text-sm">+{task.points} pts</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[#f5efdb1a] text-[#f5efdb] hover:bg-[#f5efdb1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#f5efdb] text-[#2a2a28] hover:opacity-90"
                >
                  Submit
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
  const [selectedTask, setSelectedTask] = useState<null | {
    title: string;
    type: 'discord' | 'social';
    points: number;
  }>(null);
 
  const handleTaskClick = (task: { title: string; type: 'discord' | 'social'; points: number }) => {
    setSelectedTask(task);
  };
 
  return (
    <div className="min-h-screen bg-[#1a1a18]">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {/* Project Header */}
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden mb-8">
          <Image
            src="/chronoforge-1ut4n.jpg"
            alt="ChronoForge"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-display text-[#f5efdb] mb-2">ChronoForge</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm text-[#f5efdb] bg-[#f5efdb1a] border border-[#f5efdb33]">
                COMING SOON
              </span>
              <span className="px-3 py-1 rounded-full text-sm text-purple-400 bg-purple-400/10">
                RPG
              </span>
              <span className="px-3 py-1 rounded-full text-sm text-green-400 bg-green-400/10">
                Multiplayer
              </span>
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
                ChronoForge is a radical multiplayer RPG that not only looks great but is also a global social experiment,
                infused with AI playable companions & content, operating at hyperscale with thousands of players sharing
                the battlefield in real time.
              </p>
            </div>
 
            {/* Totem NFTs */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h2 className="text-2xl font-display text-[#f5efdb] mb-4">Totem NFTs</h2>
              <p className="text-[#f5efdb99] mb-4">
                Totems are ChronoForge's "battle pass on steroids" - loaded with different utilities and limited edition NFT drops!
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#f5efdb99]">
                <li>Instant NFT drops when burned including combat capable mounts, cosmetic outfits</li>
                <li>Exclusive playable race unlocks (Koala & Saurian)</li>
                <li>Up to +200% $CHRONO winnings from Season Ladder</li>
                <li>Premium in-game currency (Forge Stamps)</li>
                <li>Baby umu pet</li>
              </ul>
            </div>
 
            {/* Whitelist Requirements */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display text-[#f5efdb]">Tasks & Progress</h2>
                <span className="text-[#f5efdb99]">0/2 Tasks Completed</span>
              </div>
 
              {/* Discord Tasks Group */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">👾</span>
                    <h3 className="text-lg font-display text-[#f5efdb]">Discord Tasks</h3>
                  </div>
                  <span className="text-[#f5efdb99]">0%</span>
                </div>
 
                {/* Task 1 */}
                <div 
                  className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                  onClick={() => handleTaskClick({
                    title: 'Announce Battlepass Trailer',
                    type: 'discord',
                    points: 50
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#f5efdb33]"></div>
                      </div>
                      <div>
                        <h4 className="text-[#f5efdb] font-medium">Announce Battlepass Trailer</h4>
                        <p className="text-[#f5efdb99] text-sm">Share the battlepass trailer in your Discord community</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-yellow-400 text-sm">+50 pts</span>
                      <span className="text-[#f5efdb66] text-sm">3/20/2024</span>
                    </div>
                  </div>
                </div>
 
                {/* Task 2 */}
                <div 
                  className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                  onClick={() => handleTaskClick({
                    title: 'Mint Day Reminder',
                    type: 'discord',
                    points: 50
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#f5efdb33]"></div>
                      </div>
                      <div>
                        <h4 className="text-[#f5efdb] font-medium">Mint Day Reminder</h4>
                        <p className="text-[#f5efdb99] text-sm">Post a reminder about the mint on February 24th</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-yellow-400 text-sm">+50 pts</span>
                      <span className="text-[#f5efdb66] text-sm">2/24/2024</span>
                    </div>
                  </div>
                </div>
 
                {/* Task 3 */}
                <div 
                  className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                  onClick={() => handleTaskClick({
                    title: 'Join Discord Community',
                    type: 'discord',
                    points: 25
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#f5efdb33]"></div>
                      </div>
                      <div>
                        <h4 className="text-[#f5efdb] font-medium">Join Discord Community</h4>
                        <p className="text-[#f5efdb99] text-sm">Join and verify in the ChronoForge Discord</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-yellow-400 text-sm">+25 pts</span>
                      <span className="text-[#f5efdb66] text-sm">Now</span>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Social Media Tasks Group */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">🐦</span>
                    <h3 className="text-lg font-display text-[#f5efdb]">Social Media Tasks</h3>
                  </div>
                  <span className="text-[#f5efdb99]">0%</span>
                </div>
 
                {/* Task 4 */}
                <div 
                  className="rounded-lg bg-[#2a2a2855] border border-[#f5efdb1a] p-4 cursor-pointer hover:bg-[#2a2a2877] transition-colors"
                  onClick={() => handleTaskClick({
                    title: 'Retweet Announcement',
                    type: 'social',
                    points: 25
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-[#f5efdb33] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#f5efdb33]"></div>
                      </div>
                      <div>
                        <h4 className="text-[#f5efdb] font-medium">Retweet Announcement</h4>
                        <p className="text-[#f5efdb99] text-sm">Retweet the official battlepass announcement</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-yellow-400 text-sm">+25 pts</span>
                      <span className="text-[#f5efdb66] text-sm">Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
            {/* How to Mint */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h2 className="text-2xl font-display text-[#f5efdb] mb-4">How to Mint</h2>
              <ol className="list-decimal list-inside space-y-2 text-[#f5efdb99]">
                <li>Make sure you have bridged funds to Abstract Chain</li>
                <li>On 24th Feb head to <a href="https://mint.chronoforge.gg/" className="text-[#f5efdb] underline hover:opacity-80">mint.chronoforge.gg</a></li>
              </ol>
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
                  <p className="text-[#f5efdb]">Abstract Chain</p>
                </div>
                <div>
                  <p className="text-[#f5efdb99] text-sm">Supply</p>
                  <p className="text-[#f5efdb]">5000 Totems</p>
                </div>
                <div>
                  <p className="text-[#f5efdb99] text-sm">Mint Date</p>
                  <p className="text-[#f5efdb]">February 24th, 2024</p>
                </div>
              </div>
            </div>
 
            {/* Mint Phases Card */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h3 className="text-lg font-display text-[#f5efdb] mb-4">Mint Phases</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[#f5efdb99] text-sm">Whitelist FCFS</p>
                  <p className="text-[#f5efdb]">4 hours - 5pm US EST</p>
                </div>
                <div>
                  <p className="text-[#f5efdb99] text-sm">Public FCFS</p>
                  <p className="text-[#f5efdb]">2 hours - 9pm US EST</p>
                </div>
              </div>
            </div>
 
            {/* Links Card */}
            <div className="rounded-xl backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] p-6">
              <h3 className="text-lg font-display text-[#f5efdb] mb-4">Important Links</h3>
              <div className="space-y-2">
                <a 
                  href="https://guide.chronoforge.gg/the-tokens/totem-nfts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#f5efdb] hover:opacity-80"
                >
                  📖 Official Guide
                </a>
                <a 
                  href="https://www.youtube.com/watch?v=O3WuqwAbEFg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#f5efdb] hover:opacity-80"
                >
                  🎥 Explainer Video
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Apply Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a18]/80 backdrop-blur-md border-t border-[#f5efdb1a] p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div>
            <h3 className="text-[#f5efdb] font-display text-center sm:text-left">Want to collaborate with ChronoForge?</h3>
            <p className="text-[#f5efdb99] text-center sm:text-left">Submit your application to become a partner</p>
          </div>
          <div className="relative group">
            <button 
              disabled
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#f5efdb33] text-[#f5efdb66] cursor-not-allowed transition-all font-medium"
            >
              Collaborate Now
            </button>
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-[#2a2a28] border border-[#f5efdb1a] rounded-lg text-[#f5efdb99] text-sm text-center
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              You can't collaborate until project is live
            </div>
          </div>
        </div>
      </div>
 
      {/* Add the Task Submission Modal */}
      {selectedTask && (
        <TaskSubmissionModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </div>
  );
} 