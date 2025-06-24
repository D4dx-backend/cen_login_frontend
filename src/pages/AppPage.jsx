import React from 'react';
import Sidebar from '../components/Sidebar';
import PageBackground from '../components/PageBackground';
import AppList from '../components/AppList';
import ProfileButton from '../components/ProfileButton';
import { useSidebar } from '../contexts/SidebarContext';

export default function AppPage() {
  const { isMinimized } = useSidebar();
  
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className={`relative z-20 transition-all duration-500 ease-in-out ${
        isMinimized ? 'ml-20' : 'ml-72'
      } flex flex-col min-h-screen`}>
        {/* Profile Button - Top Right with responsive positioning */}
        <div className="absolute top-4 sm:top-5 lg:top-6 right-4 sm:right-5 lg:right-6 z-30">
          <ProfileButton />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header Section */}
          <header className="pt-16 sm:pt-18 lg:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5041BC] leading-tight">
                    Application Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and monitor your applications efficiently
                  </p>
                </div>
                {/* Optional quick stats or actions could go here */}
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-12">
            <div className="max-w-7xl mx-auto">
              <AppList />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 