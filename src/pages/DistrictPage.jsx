import React from 'react';
import Sidebar from '../components/Sidebar';
import SearchHeader from '../components/SearchHeader';
import PageBackground from '../components/PageBackground';

export default function DistrictPage() {
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="relative z-20 ml-72 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col p-8">
          <div className="sticky top-0 z-30 bg-[#e3e6eb]">
            <SearchHeader />
          </div>
          <main className="flex-1 min-w-0">
            <div className="mt-8 text-2xl font-bold text-[#5041BC]">District Page</div>
            <div className="mt-4 text-[#5041BC]">Content for District will go here.</div>
          </main>
        </div>
      </div>
    </div>
  );
} 