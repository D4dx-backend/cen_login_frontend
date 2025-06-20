import React from 'react';
import Sidebar from '../components/Sidebar';
import SearchHeader from '../components/SearchHeader';
import PageBackground from '../components/PageBackground';
import AppList from '../components/AppList';

export default function AppPage() {
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 ml-72 flex flex-col min-h-screen">
        <div className="sticky top-0 z-30 bg-[#e3e6eb]">
          <SearchHeader />
        </div>
        <div className="flex-1 flex flex-col p-8">
          <main className="flex-1 min-w-0 mt-8">
            <h2 className="text-3xl font-extrabold text-[#5041BC] mb-2">Applications</h2>
            <AppList />
          </main>
        </div>
      </div>
    </div>
  );
} 