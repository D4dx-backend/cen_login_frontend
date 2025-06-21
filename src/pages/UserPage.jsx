import React from 'react';
import Sidebar from '../components/Sidebar';
import SearchHeader from '../components/SearchHeader';
import PageBackground from '../components/PageBackground';
import UserListTable from '../components/UserListTable';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';

export default function UserPage() {
  return (
    <div className="min-h-screen relative bg-[#e3e6eb] overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <PageBackground />
      {/* Sidebar fixed - full window height */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      {/* Main content positioned to the right of sidebar */}
      <div className="relative z-20 ml-72 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col p-8">
          <div className="sticky top-0 z-30 bg-[#e3e6eb]">
            <SearchHeader />
          </div>
          <main className="flex-1 min-w-0 mt-8">
            {/* Heading */}
            <h2 className="text-3xl font-extrabold text-[#5041BC] mb-2">User Management</h2>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center w-full sm:w-auto gap-2">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5041BC]/30 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-100/60 hover:bg-gray-100 rounded-lg px-4 py-2.5 transition-colors">
                  <FiFilter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 text-sm font-medium text-white bg-gradient-to-r from-[#5041BC] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#5041BC] rounded-lg px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <FiPlus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </div>
            {/* User Table */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <UserListTable />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 