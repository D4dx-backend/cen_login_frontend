import React from 'react';
import Sidebar from '../components/Sidebar';
import SearchHeader from '../components/SearchHeader';
import PageBackground from '../components/PageBackground';

export default function HalqaPage() {
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      <div className="absolute left-0 top-0 bottom-0 z-10 h-full">
        <Sidebar />
      </div>
      <div className="relative z-20 ml-72 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col p-8">
          <main className="flex-1 min-w-0">
            <SearchHeader />
            <div className="mt-8 text-2xl font-bold text-[#5041BC]">Halqa Page</div>
            <div className="mt-4 text-[#5041BC]">Content for Halqa will go here.</div>
          </main>
        </div>
      </div>
    </div>
  );
} 