'use client';

import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useState, useEffect } from 'react';
import OnboardingPopup from './components/OnboardingPopup';
import DashboardLayout from './dashboard/layout';
import DashboardPage from './dashboard/page';

interface DynamicUser {
  id?: string;
  email?: string;
}

interface DynamicContext {
  user: DynamicUser | null;
  isAuthenticated: boolean;
  handleLogOut: () => void;
}

export default function Home() {
  const { user, handleLogOut, isAuthenticated } = useDynamicContext() as DynamicContext;
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (mounted && isAuthenticated && user?.email) {
        try {
          const response = await fetch(`/api/user?email=${user.email}`);
          const userData = await response.json();
          
          if (!response.ok || !userData || !userData.onboarding_completed) {
            setOnboardingCompleted(false);
            setShowOnboarding(true);
          } else {
            setOnboardingCompleted(true);
            setShowOnboarding(false);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setOnboardingCompleted(false);
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(false);
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, mounted]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  // If authenticated and onboarding completed, show dashboard
  if (isAuthenticated && onboardingCompleted) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  // Otherwise show login page
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a18] via-[#2a2a28] to-[#1a1a18] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-stretch">
        {/* Left Side - Hero Section */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-16 overflow-hidden">
          <div className="max-w-2xl mx-auto md:mx-0">
            {/* Logo with Animation */}
            <div className="mb-6">
              <img 
                src="/DLlogo.png" 
                alt="Darknight Labs Logo" 
                className="w-40 md:w-48 lg:w-56"
              />
            </div>
            
            {/* Hero Text */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display text-[#f5efdb] mb-4 leading-tight">
              Welcome to the Future of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5efdb] to-[#a39b7d]">
                Web3 Development
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-[#f5efdb99] max-w-xl mb-6">
              Join Darknight Labs in building the next generation of decentralized applications. 
              Connect your wallet to start your journey into the future.
            </p>

            {/* Feature Points */}
            <div className="space-y-3 text-[#f5efdb99] text-sm md:text-base">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f5efdb]" />
                <span>Secure Web3 Authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f5efdb]" />
                <span>Decentralized Infrastructure</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f5efdb]" />
                <span>Community-Driven Development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Connect Widget */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16 bg-[#1a1a18]/50 backdrop-blur-xl">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-md bg-[#2a2a2833] border border-[#f5efdb1a] rounded-2xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl md:text-2xl font-display text-[#f5efdb] mb-6 text-center">Connect Your Wallet</h2>
              <DynamicWidget />
            </div>
          </div>
        </div>
      </div>

      {showOnboarding && mounted && !onboardingCompleted && (
        <OnboardingPopup 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
    </div>
  );
}
